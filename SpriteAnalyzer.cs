using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Collections.Generic;
using System.Runtime.InteropServices;

class SpriteAnalyzer
{
    static void Main()
    {
        string basePath = @"c:\Users\ashin\Downloads\卓越工程师大冒险";
        string refImagePath = Path.Combine(basePath, @"assets\images\characters\d62e7d8f70a55940ac0f4e94cd4bfcea.jpg");
        string spriteSheetPath = Path.Combine(basePath, @"assets\images\characters\female_spritesheet.png");
        
        Console.WriteLine("=== 精灵图分析脚本 ===");
        Console.WriteLine();
        
        using (Bitmap refImg = new Bitmap(refImagePath))
        using (Bitmap spriteImg = new Bitmap(spriteSheetPath))
        {
            Console.WriteLine($"参考图尺寸: {refImg.Width}x{refImg.Height}");
            Console.WriteLine($"精灵图尺寸: {spriteImg.Width}x{spriteImg.Height}");
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
            
            Console.WriteLine($"已切分参考图为 {refFrames.Count} 帧 ({refFrameW}x{refFrameH})");
            Console.WriteLine();
            
            int spriteFrameW = 112, spriteFrameH = 80;
            int rows = spriteImg.Height / spriteFrameH;
            int cols = spriteImg.Width / spriteFrameW;
            
            Console.WriteLine($"精灵图网格: {cols} 列 x {rows} 行");
            Console.WriteLine();
            
            string[] animNames = { "idle", "run_left", "run_right", "jump_start", "airborne", "landing", 
                                   "crouch", "crouch_walk", "hurt", "knockback", "death", "pickup", "operate", "victory" };
            
            Console.WriteLine("=== 逐行相似度分数 ===");
            Console.WriteLine("行号 | Y坐标 | 平均差异 | 各帧差异");
            Console.WriteLine("-----|-------|----------|----------");
            
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
                
                string frameDiffStr = string.Join(", ", frameDiffs.ConvertAll(d => d.ToString("F2")));
                Console.WriteLine($"{row,4} | {yOff,5} | {avgScore,8:F2} | {frameDiffStr}");
                
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
            Console.WriteLine("=== 最佳匹配结果 ===");
            var best = rowData.Find(r => r.Row == bestRow);
            Console.WriteLine($"最佳匹配行: 第 {bestRow} 行");
            Console.WriteLine($"Y坐标: {bestY}");
            Console.WriteLine($"平均像素差异: {bestScore:F2} (数值越小越相似)");
            Console.WriteLine($"动画类型: {best.AnimType}");
            Console.WriteLine();
            
            Console.WriteLine("=== 向右跑步动画检测 (面向右边、马尾在左后方) ===");
            foreach (var r in rowData)
            {
                bool isFacingRight = r.LeftBias < -0.05;
                bool isRow2 = r.Row == 2;
                if (isFacingRight || isRow2)
                {
                    Console.WriteLine($"  - 行 {r.Row} (Y={r.Y}): {r.AnimType} [LeftBias={r.LeftBias:F3}]");
                }
            }
            Console.WriteLine();
            
            Console.WriteLine("=== 各行动画详细描述 ===");
            foreach (var r in rowData)
            {
                string facing = r.LeftBias > 0.05 ? "面向左侧" : 
                                r.LeftBias < -0.05 ? "面向右侧" : "面向前方/居中";
                string pose;
                
                if (r.AnimType.Contains("run")) pose = "跑步姿势";
                else if (r.AnimType.Contains("jump") || r.AnimType.Contains("air")) pose = "跳跃/腾空";
                else if (r.AnimType.Contains("crouch")) pose = "下蹲姿势";
                else if (r.AnimType.Contains("land")) pose = "落地姿势";
                else if (r.AnimType.Contains("death") || r.AnimType.Contains("hurt")) pose = "受伤/倒地";
                else if (r.TopBias > 0.1) pose = "向上伸展";
                else if (r.TopBias < -0.1) pose = "重心较低";
                else pose = "站立姿势";
                
                Console.WriteLine($"行 {r.Row} (Y={r.Y}, 差异={r.AvgDiff:F2}): {r.AnimType} - {facing}, {pose} (像素数:{r.AvgPixels}, 高度:{r.PixelHeight})");
            }
            
            foreach (var f in refFrames) f.Dispose();
        }
        
        Console.WriteLine();
        Console.WriteLine("分析完成！");
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

class RowInfo
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
