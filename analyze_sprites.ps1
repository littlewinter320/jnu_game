Add-Type -AssemblyName System.Drawing

$basePath = "c:\Users\ashin\Downloads\卓越工程师大冒险"
$refImagePath = Join-Path $basePath "assets\images\characters\d62e7d8f70a55940ac0f4e94cd4bfcea.jpg"
$spriteSheetPath = Join-Path $basePath "assets\images\characters\female_spritesheet.png"

Write-Host "=== 精灵图分析脚本 ===" -ForegroundColor Cyan
Write-Host ""

$refImg = [System.Drawing.Bitmap]::FromFile($refImagePath)
$spriteImg = [System.Drawing.Bitmap]::FromFile($spriteSheetPath)

Write-Host "参考图尺寸: $($refImg.Width)x$($refImg.Height)"
Write-Host "精灵图尺寸: $($spriteImg.Width)x$($spriteImg.Height)"
Write-Host ""

$refFrameWidth = 98
$refFrameHeight = 82
$refFrames = @()

for ($i = 0; $i -lt 4; $i++) {
    $bmp = New-Object System.Drawing.Bitmap($refFrameWidth, $refFrameHeight)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.DrawImage($refImg, (New-Object System.Drawing.Rectangle(0, 0, $refFrameWidth, $refFrameHeight)), 
        (New-Object System.Drawing.Rectangle($i * $refFrameWidth, 0, $refFrameWidth, $refFrameHeight)), 
        [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $refFrames += $bmp
}

Write-Host "已切分参考图为 $($refFrames.Count) 帧 ($refFrameWidth x $refFrameHeight)"
Write-Host ""

$spriteFrameWidth = 112
$spriteFrameHeight = 80
$rows = [math]::Floor($spriteImg.Height / $spriteFrameHeight)
$cols = [math]::Floor($spriteImg.Width / $spriteFrameWidth)

Write-Host "精灵图网格: $cols 列 x $rows 行"
Write-Host ""

function Compare-Frames {
    param([System.Drawing.Bitmap]$frameA, [System.Drawing.Bitmap]$frameB)
    
    $targetW = [math]::Min($frameA.Width, $frameB.Width)
    $targetH = [math]::Min($frameA.Height, $frameB.Height)
    $totalDiff = 0
    $pixelCount = $targetW * $targetH
    $offsetX = [math]::Floor(($frameB.Width - $targetW) / 2)
    $offsetY = [math]::Floor(($frameB.Height - $targetH) / 2)
    
    for ($y = 0; $y -lt $targetH; $y++) {
        for ($x = 0; $x -lt $targetW; $x++) {
            $pA = $frameA.GetPixel($x, $y)
            $xB = $x + $offsetX
            $yB = $y + $offsetY
            $pB = $frameB.GetPixel($xB, $yB)
            
            $dr = [math]::Abs($pA.R - $pB.R)
            $dg = [math]::Abs($pA.G - $pB.G)
            $db = [math]::Abs($pA.B - $pB.B)
            $totalDiff += ($dr + $dg + $db) / 3
        }
    }
    
    $avgDiff = $totalDiff / $pixelCount
    return [math]::Round($avgDiff, 2)
}

$animNames = @("idle", "run_left", "run_right", "jump_start", "airborne", "landing", 
               "crouch", "crouch_walk", "hurt", "knockback", "death", "pickup", "operate", "victory")

Write-Host "=== 逐行相似度分数 ===" -ForegroundColor Yellow
Write-Host "行号 | Y坐标 | 平均差异 | 各帧差异"
Write-Host "-----|-------|----------|----------"

$rowResults = @()
$bestScore = [double]::MaxValue
$bestRow = -1
$bestY = -1

for ($row = 0; $row -lt $rows; $row++) {
    $yOffset = $row * $spriteFrameHeight
    if ($yOffset + $spriteFrameHeight -gt $spriteImg.Height) { break }
    
    $rowScore = 0
    $frameScores = @()
    $totalNonTransparent = 0
    $leftNonTransparent = 0
    $rightNonTransparent = 0
    $topNonTransparent = 0
    $bottomNonTransparent = 0
    $minPixelY = $spriteFrameHeight
    $maxPixelY = 0
    
    for ($col = 0; $col -lt 4; $col++) {
        $xOffset = $col * $spriteFrameWidth
        if ($xOffset + $spriteFrameWidth -gt $spriteImg.Width) { break }
        
        $spriteFrame = New-Object System.Drawing.Bitmap($spriteFrameWidth, $spriteFrameHeight)
        $g = [System.Drawing.Graphics]::FromImage($spriteFrame)
        $g.DrawImage($spriteImg, (New-Object System.Drawing.Rectangle(0, 0, $spriteFrameWidth, $spriteFrameHeight)), 
            (New-Object System.Drawing.Rectangle($xOffset, $yOffset, $spriteFrameWidth, $spriteFrameHeight)), 
            [System.Drawing.GraphicsUnit]::Pixel)
        $g.Dispose()
        
        if ($col -lt $refFrames.Count) {
            $diff = Compare-Frames $refFrames[$col] $spriteFrame
            $frameScores += $diff
            $rowScore += $diff
        }
        
        for ($py = 0; $py -lt $spriteFrameHeight; $py++) {
            for ($px = 0; $px -lt $spriteFrameWidth; $px++) {
                $pixel = $spriteFrame.GetPixel($px, $py)
                if ($pixel.A -gt 10) {
                    $totalNonTransparent++
                    if ($px -lt [math]::Floor($spriteFrameWidth / 2)) { $leftNonTransparent++ }
                    else { $rightNonTransparent++ }
                    if ($py -lt [math]::Floor($spriteFrameHeight / 2)) { $topNonTransparent++ }
                    else { $bottomNonTransparent++ }
                    if ($py -lt $minPixelY) { $minPixelY = $py }
                    if ($py -gt $maxPixelY) { $maxPixelY = $py }
                }
            }
        }
        
        $spriteFrame.Dispose()
    }
    
    $avgScore = [math]::Round($rowScore / [math]::Min(4, $refFrames.Count), 2)
    if ($avgScore -lt $bestScore) {
        $bestScore = $avgScore
        $bestRow = $row
        $bestY = $yOffset
    }
    
    $leftBias = if ($totalNonTransparent -gt 0) { 
        [math]::Round(($leftNonTransparent - $rightNonTransparent) / $totalNonTransparent, 3) 
    } else { 0 }
    $topBias = if ($totalNonTransparent -gt 0) { 
        [math]::Round(($topNonTransparent - $bottomNonTransparent) / $totalNonTransparent, 3) 
    } else { 0 }
    $pixelHeight = $maxPixelY - $minPixelY
    $avgPixels = [math]::Round($totalNonTransparent / 4, 0)
    
    $animType = if ($row -lt $animNames.Count) { $animNames[$row] } else { "unknown" }
    
    $frameDiffStr = ($frameScores | ForEach-Object { $_.ToString("F2") }) -join ", "
    Write-Host ("{0,4} | {1,5} | {2,8:F2} | {3}" -f $row, $yOffset, $avgScore, $frameDiffStr)
    
    $rowResults += [PSCustomObject]@{
        Row = $row
        Y = $yOffset
        AvgDiff = $avgScore
        FrameDiffs = $frameScores
        LeftBias = $leftBias
        TopBias = $topBias
        AvgPixels = $avgPixels
        AnimType = $animType
        PixelHeight = $pixelHeight
    }
}

Write-Host ""
Write-Host "=== 最佳匹配结果 ===" -ForegroundColor Green
$bestMatch = $rowResults | Where-Object { $_.Row -eq $bestRow } | Select-Object -First 1
Write-Host "最佳匹配行: 第 $bestRow 行"
Write-Host "Y坐标: $bestY"
Write-Host "平均像素差异: $bestScore (数值越小越相似)"
Write-Host "动画类型: $($bestMatch.AnimType)"
Write-Host ""

Write-Host "=== 向右跑步动画检测 (面向右边、马尾在左后方) ===" -ForegroundColor Magenta
foreach ($r in $rowResults) {
    $isFacingRight = $r.LeftBias -lt -0.05
    $isRow2 = $r.Row -eq 2
    if ($isFacingRight -or $isRow2) {
        Write-Host "  - 行 $($r.Row) (Y=$($r.Y)): $($r.AnimType) [LeftBias=$($r.LeftBias)]"
    }
}
Write-Host ""

Write-Host "=== 各行动画详细描述 ===" -ForegroundColor Cyan
foreach ($r in $rowResults) {
    if ($r.LeftBias -gt 0.05) { $facing = "面向左侧" }
    elseif ($r.LeftBias -lt -0.05) { $facing = "面向右侧" }
    else { $facing = "面向前方/居中" }
    
    if ($r.AnimType.Contains("run")) { $pose = "跑步姿势" }
    elseif ($r.AnimType.Contains("jump") -or $r.AnimType.Contains("air")) { $pose = "跳跃/腾空" }
    elseif ($r.AnimType.Contains("crouch")) { $pose = "下蹲姿势" }
    elseif ($r.AnimType.Contains("land")) { $pose = "落地姿势" }
    elseif ($r.AnimType.Contains("death") -or $r.AnimType.Contains("hurt")) { $pose = "受伤/倒地" }
    elseif ($r.TopBias -gt 0.1) { $pose = "向上伸展" }
    elseif ($r.TopBias -lt -0.1) { $pose = "重心较低" }
    else { $pose = "站立姿势" }
    
    Write-Host "行 $($r.Row) (Y=$($r.Y), 差异=$($r.AvgDiff)): $($r.AnimType) - $facing, $pose (像素数:$($r.AvgPixels), 高度:$($r.PixelHeight))"
}

foreach ($f in $refFrames) { $f.Dispose() }
$refImg.Dispose()
$spriteImg.Dispose()

Write-Host ""
Write-Host "分析完成！" -ForegroundColor Green
