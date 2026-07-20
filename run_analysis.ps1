$refImagePath = Join-Path $PSScriptRoot "assets\images\characters\d62e7d8f70a55940ac0f4e94cd4bfcea.jpg"
$spriteSheetPath = Join-Path $PSScriptRoot "assets\images\characters\female_spritesheet.png"

Add-Type -ReferencedAssemblies System.Drawing -IgnoreWarnings -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class SpriteAnalyzer
{
    public static void Run(string refPath, string spritePath)
    {
        Console.WriteLine("=== Sprite Sheet Analysis ===");
        Console.WriteLine();
        
        using (Bitmap refImg = new Bitmap(refPath))
        using (Bitmap spriteImg = new Bitmap(spritePath))
        {
            Console.WriteLine("Reference image size: " + refImg.Width + "x" + refImg.Height);
            Console.WriteLine("Sprite sheet size: " + spriteImg.Width + "x" + spriteImg.Height);
            Console.WriteLine();
            
            int refFrameW = 98, refFrameH = 82;
            List<Bitmap> refFrames = new List<Bitmap>();
            
            for (int i = 0; i < 4; i++)
            {
                Bitmap bmp = new Bitmap(refFrameW, refFrameH, PixelFormat.Format32bppArgb);
                using (Graphics g = Graphics.FromImage(bmp))
                {
                    g.DrawImage(refImg, 
                        new Rectangle(0, 0, refFrameW, refFrameH),
                        new Rectangle(i * refFrameW, 0, refFrameW, refFrameH),
                        GraphicsUnit.Pixel);
                }
                refFrames.Add(bmp);
            }
            
            Console.WriteLine("Split reference into " + refFrames.Count + " frames (" + refFrameW + "x" + refFrameH + ")");
            Console.WriteLine();
            
            int spriteFrameW = 112, spriteFrameH = 80;
            int rows = spriteImg.Height / spriteFrameH;
            int cols = spriteImg.Width / spriteFrameW;
            
            Console.WriteLine("Sprite grid: " + cols + " cols x " + rows + " rows");
            Console.WriteLine();
            
            string[] animNames = { "idle", "run_left", "run_right", "jump_start", "airborne", "landing", 
                                   "crouch", "crouch_walk", "hurt", "knockback", "death", "pickup", "operate", "victory" };
            
            Console.WriteLine("=== Per-Row Similarity Scores ===");
            Console.WriteLine("Row | Y     | AvgDiff | Frame Diffs");
            Console.WriteLine("----|-------|---------|------------");
            
            var rowData = new List<RowInfo>();
            double bestScore = double.MaxValue;
            int bestRow = -1, bestY = -1;
            
            for (int row = 0; row < rows; row++)
            {
                int yOff = row * spriteFrameH;
                if (yOff + spriteFrameH > spriteImg.Height) break;
                
                double rowTotal = 0;
                var frameDiffs = new List<double>();
                int totalNonTransparent = 0;
                int leftNonTransparent = 0, rightNonTransparent = 0;
                int topNonTransparent = 0, bottomNonTransparent = 0;
                int minPixelY = spriteFrameH, maxPixelY = 0;
                
                for (int col = 0; col < 4; col++)
                {
                    int xOff = col * spriteFrameW;
                    if (xOff + spriteFrameW > spriteImg.Width) break;
                    
                    using (Bitmap frame = new Bitmap(spriteFrameW, spriteFrameH, PixelFormat.Format32bppArgb))
                    {
                        using (Graphics g = Graphics.FromImage(frame))
                        {
                            g.DrawImage(spriteImg,
                                new Rectangle(0, 0, spriteFrameW, spriteFrameH),
                                new Rectangle(xOff, yOff, spriteFrameW, spriteFrameH),
                                GraphicsUnit.Pixel);
                        }
                        
                        if (col < refFrames.Count)
                        {
                            double diff = CompareFramesFast(refFrames[col], frame);
                            frameDiffs.Add(diff);
                            rowTotal += diff;
                        }
                        
                        AnalyzeFrame(frame, ref totalNonTransparent, ref leftNonTransparent, ref rightNonTransparent,
                                     ref topNonTransparent, ref bottomNonTransparent, ref minPixelY, ref maxPixelY);
                    }
                }
                
                double avgScore = Math.Round(rowTotal / Math.Min(4, refFrames.Count), 2);
                if (avgScore < bestScore)
                {
                    bestScore = avgScore;
                    bestRow = row;
                    bestY = yOff;
                }
                
                double leftBias = totalNonTransparent > 0 ? 
                    Math.Round((double)(leftNonTransparent - rightNonTransparent) / totalNonTransparent, 3) : 0;
                double topBias = totalNonTransparent > 0 ? 
                    Math.Round((double)(topNonTransparent - bottomNonTransparent) / totalNonTransparent, 3) : 0;
                int pixelHeight = maxPixelY - minPixelY;
                int avgPixels = totalNonTransparent / 4;
                
                string animType = row < animNames.Length ? animNames[row] : "unknown";
                
                List<string> diffStrings = new List<string>();
                foreach (double d in frameDiffs) diffStrings.Add(d.ToString("F2"));
                string frameDiffStr = string.Join(", ", diffStrings.ToArray());
                Console.WriteLine(string.Format("{0,3} | {1,5} | {2,7:F2} | {3}", row, yOff, avgScore, frameDiffStr));
                
                rowData.Add(new RowInfo
                {
                    Row = row,
                    Y = yOff,
                    AvgDiff = avgScore,
                    LeftBias = leftBias,
                    TopBias = topBias,
                    AvgPixels = avgPixels,
                    AnimType = animType,
                    PixelHeight = pixelHeight
                });
            }
            
            Console.WriteLine();
            Console.WriteLine("=== Best Match ===");
            RowInfo best = null;
            foreach (RowInfo r in rowData) { if (r.Row == bestRow) { best = r; break; } }
            Console.WriteLine("Best matching row: Row " + bestRow);
            Console.WriteLine("Y coordinate: " + bestY);
            Console.WriteLine("Average pixel difference: " + bestScore.ToString("F2") + " (lower is better)");
            Console.WriteLine("Animation type: " + best.AnimType);
            Console.WriteLine();
            
            Console.WriteLine("=== Right-Running Animation Detection ===");
            foreach (RowInfo r in rowData)
            {
                bool isFacingRight = r.LeftBias < -0.05;
                bool isRow2 = r.Row == 2;
                if (isFacingRight || isRow2)
                {
                    Console.WriteLine("  - Row " + r.Row + " (Y=" + r.Y + "): " + r.AnimType + " [LeftBias=" + r.LeftBias.ToString("F3") + "]");
                }
            }
            Console.WriteLine();
            
            Console.WriteLine("=== Detailed Row Descriptions ===");
            foreach (RowInfo r in rowData)
            {
                string facing;
                if (r.LeftBias > 0.05) facing = "facing left";
                else if (r.LeftBias < -0.05) facing = "facing right";
                else facing = "facing forward/centered";
                
                string pose;
                if (r.AnimType.Contains("run")) pose = "running pose";
                else if (r.AnimType.Contains("jump") || r.AnimType.Contains("air")) pose = "jumping/airborne";
                else if (r.AnimType.Contains("crouch")) pose = "crouching";
                else if (r.AnimType.Contains("land")) pose = "landing pose";
                else if (r.AnimType.Contains("death") || r.AnimType.Contains("hurt")) pose = "hurt/dying";
                else if (r.TopBias > 0.1) pose = "reaching up";
                else if (r.TopBias < -0.1) pose = "low center of gravity";
                else pose = "standing pose";
                
                Console.WriteLine("Row " + r.Row + " (Y=" + r.Y + ", diff=" + r.AvgDiff.ToString("F2") + "): " + 
                    r.AnimType + " - " + facing + ", " + pose + " (pixels:" + r.AvgPixels + ", height:" + r.PixelHeight + ")");
            }
            
            foreach (Bitmap f in refFrames) f.Dispose();
        }
        
        Console.WriteLine();
        Console.WriteLine("Analysis complete!");
    }
    
    static double CompareFramesFast(Bitmap a, Bitmap b)
    {
        int w = Math.Min(a.Width, b.Width);
        int h = Math.Min(a.Height, b.Height);
        int offsetX = (b.Width - w) / 2;
        int offsetY = (b.Height - h) / 2;
        
        BitmapData dataA = a.LockBits(new Rectangle(0, 0, a.Width, a.Height), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
        BitmapData dataB = b.LockBits(new Rectangle(0, 0, b.Width, b.Height), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
        
        byte[] bufA = new byte[dataA.Stride * dataA.Height];
        byte[] bufB = new byte[dataB.Stride * dataB.Height];
        
        Marshal.Copy(dataA.Scan0, bufA, 0, bufA.Length);
        Marshal.Copy(dataB.Scan0, bufB, 0, bufB.Length);
        
        a.UnlockBits(dataA);
        b.UnlockBits(dataB);
        
        long totalDiff = 0;
        
        for (int y = 0; y < h; y++)
        {
            for (int x = 0; x < w; x++)
            {
                int idxA = (y * dataA.Stride) + (x * 4);
                int idxB = ((y + offsetY) * dataB.Stride) + ((x + offsetX) * 4);
                
                int dr = Math.Abs(bufA[idxA + 2] - bufB[idxB + 2]);
                int dg = Math.Abs(bufA[idxA + 1] - bufB[idxB + 1]);
                int db = Math.Abs(bufA[idxA] - bufB[idxB]);
                totalDiff += (dr + dg + db) / 3;
            }
        }
        
        return Math.Round((double)totalDiff / (w * h), 2);
    }
    
    static void AnalyzeFrame(Bitmap frame, ref int totalNonTransparent, 
        ref int leftNonTransparent, ref int rightNonTransparent,
        ref int topNonTransparent, ref int bottomNonTransparent,
        ref int minPixelY, ref int maxPixelY)
    {
        BitmapData data = frame.LockBits(new Rectangle(0, 0, frame.Width, frame.Height), 
            ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
        byte[] buf = new byte[data.Stride * data.Height];
        Marshal.Copy(data.Scan0, buf, 0, buf.Length);
        frame.UnlockBits(data);
        
        int midX = frame.Width / 2;
        int midY = frame.Height / 2;
        
        for (int py = 0; py < frame.Height; py++)
        {
            for (int px = 0; px < frame.Width; px++)
            {
                int idx = (py * data.Stride) + (px * 4);
                byte a = buf[idx + 3];
                if (a > 10)
                {
                    totalNonTransparent++;
                    if (px < midX) leftNonTransparent++;
                    else rightNonTransparent++;
                    if (py < midY) topNonTransparent++;
                    else bottomNonTransparent++;
                    if (py < minPixelY) minPixelY = py;
                    if (py > maxPixelY) maxPixelY = py;
                }
            }
        }
    }
}

public class RowInfo
{
    public int Row;
    public int Y;
    public double AvgDiff;
    public double LeftBias;
    public double TopBias;
    public int AvgPixels;
    public string AnimType;
    public int PixelHeight;
}
'@

[SpriteAnalyzer]::Run($refImagePath, $spriteSheetPath)
