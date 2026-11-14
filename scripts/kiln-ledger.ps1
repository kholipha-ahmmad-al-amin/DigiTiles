Add-Type -AssemblyName System.Drawing

$root = "D:\all my projects\Digitiles"
$fontDir = Join-Path $root ".agents\skills\canvas-design\canvas-fonts"
$out = Join-Path $root "public\brand\kiln-ledger.png"

$fonts = New-Object System.Drawing.Text.PrivateFontCollection
$fonts.AddFontFile((Join-Path $fontDir "InstrumentSans-Regular.ttf"))
$fonts.AddFontFile((Join-Path $fontDir "JetBrainsMono-Regular.ttf"))
$sans = $fonts.Families[0]
$mono = $fonts.Families[1]

$bmp = New-Object System.Drawing.Bitmap 1600, 980
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.Clear([System.Drawing.Color]::FromArgb(247, 246, 242))

$ink = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(17, 24, 39))
$muted = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(75, 85, 99))
$line = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(214, 211, 205)), 1
$g.DrawRectangle($line, 36, 36, 1528, 908)

$titleFont = [System.Drawing.Font]::new($sans, [single]18, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Point)
$labelFont = [System.Drawing.Font]::new($mono, [single]11, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Point)
$g.DrawString("KILN LEDGER", $titleFont, $ink, 64, 58)
$g.DrawString("FIRED SURFACE  /  LOT RECORD", $labelFont, $muted, 64, 92)

function Fill-Rect($x, $y, $w, $h, $r, $gc, $b) {
  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($r, $gc, $b))
  $g.FillRectangle($brush, $x, $y, $w, $h)
  $brush.Dispose()
}

$tiles = @(
  @{ name = "01  CARRARA"; draw = "marble" },
  @{ name = "02  MATT"; draw = "concrete" },
  @{ name = "03  KILN"; draw = "clay" },
  @{ name = "04  VEIN"; draw = "trav" },
  @{ name = "05  GLAZE"; draw = "onyx" },
  @{ name = "06  GRAIN"; draw = "wood" },
  @{ name = "07  TESSERA"; draw = "mosaic" },
  @{ name = "08  BODY"; draw = "porcelain" }
)

$size = 300
$gap = 22
$originX = [int]((1600 - (4 * $size + 3 * $gap)) / 2)
$originY = 150

for ($i = 0; $i -lt $tiles.Count; $i++) {
  $col = $i % 4
  $row = [Math]::Floor($i / 4)
  $x = $originX + $col * ($size + $gap)
  $y = $originY + $row * ($size + $gap + 28)
  $kind = $tiles[$i].draw

  if ($kind -eq "marble") { Fill-Rect $x $y $size $size 243 241 235 }
  elseif ($kind -eq "concrete") { Fill-Rect $x $y $size $size 141 148 150 }
  elseif ($kind -eq "clay") { Fill-Rect $x $y $size $size 163 75 50 }
  elseif ($kind -eq "trav") { Fill-Rect $x $y $size $size 230 203 168 }
  elseif ($kind -eq "onyx") { Fill-Rect $x $y $size $size 232 215 174 }
  elseif ($kind -eq "wood") { Fill-Rect $x $y $size $size 141 90 52 }
  elseif ($kind -eq "mosaic") { Fill-Rect $x $y $size $size 214 211 205 }
  else { Fill-Rect $x $y $size $size 246 245 241 }

  $rand = New-Object System.Random ($i + 7)
  if ($kind -eq "marble") {
    $penA = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(140, 125, 132, 136)), 5
    $penB = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(160, 139, 144, 148)), 1.4
    $g.DrawBezier($penA, $x - 10, $y + 210, $x + 80, $y + 120, $x + 160, $y + 150, $x + 310, $y + 40)
    $g.DrawBezier($penB, $x - 10, $y + 228, $x + 90, $y + 140, $x + 170, $y + 168, $x + 310, $y + 58)
    $penA.Dispose(); $penB.Dispose()
  } elseif ($kind -eq "concrete" -or $kind -eq "clay") {
    for ($n = 0; $n -lt 42; $n++) {
      $cx = $x + 16 + $rand.Next($size - 32)
      $cy = $y + 16 + $rand.Next($size - 32)
      $shade = if ($kind -eq "clay") { if ($n % 3 -eq 0) { [System.Drawing.Color]::FromArgb(90, 122, 49, 34) } else { [System.Drawing.Color]::FromArgb(70, 240, 194, 164) } } else { [System.Drawing.Color]::FromArgb(90, 63, 71, 73) }
      $b = New-Object System.Drawing.SolidBrush $shade
      $rw = 3 + ($n % 4)
      $g.FillEllipse($b, $cx, $cy, $(if ($kind -eq "clay") { $rw * 2 } else { 2 }), $(if ($kind -eq "clay") { 3 } else { 2 }))
      $b.Dispose()
    }
  } elseif ($kind -eq "trav") {
    $pit = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(110, 176, 137, 104))
    for ($n = 0; $n -lt 5; $n++) {
      $py = $y + 36 + $n * 52
      for ($m = 0; $m -lt 4; $m++) {
        $g.FillRectangle($pit, $x + 24 + $m * 68 + ($n % 2) * 10, $py, 16 + ($m % 3) * 6, 3)
      }
    }
    $pit.Dispose()
  } elseif ($kind -eq "onyx") {
    $band = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(70, 196, 161, 90))
    $g.FillRectangle($band, $x, $y + 36, $size, 22)
    $g.FillRectangle($band, $x, $y + 150, $size, 34)
    $band.Dispose()
    $gloss = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(90, 255, 250, 240)), 10
    $g.DrawLine($gloss, $x + 36, $y + 8, $x + 48, $y + 292)
    $gloss.Dispose()
  } elseif ($kind -eq "wood") {
    $joint = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(180, 92, 52, 24)), 3
    $grain = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(140, 92, 52, 24)), 1
    foreach ($jx in @(72, 150, 228)) { $g.DrawLine($joint, $x + $jx, $y, $x + $jx, $y + $size) }
    for ($n = 0; $n -lt 8; $n++) {
      $gy = $y + 24 + $n * 34
      $g.DrawBezier($grain, $x + 8, $gy, $x + 40, $gy - 8, $x + 60, $gy + 8, $x + 68, $gy)
      $g.DrawBezier($grain, $x + 80, $gy + 6, $x + 110, $gy - 4, $x + 136, $gy + 10, $x + 146, $gy + 4)
    }
    $joint.Dispose(); $grain.Dispose()
  } elseif ($kind -eq "mosaic") {
    $tones = @(
      [System.Drawing.Color]::FromArgb(31, 106, 100),
      [System.Drawing.Color]::FromArgb(61, 133, 120),
      [System.Drawing.Color]::FromArgb(22, 78, 76),
      [System.Drawing.Color]::FromArgb(47, 122, 112)
    )
    for ($r = 0; $r -lt 8; $r++) {
      for ($c = 0; $c -lt 8; $c++) {
        $b = New-Object System.Drawing.SolidBrush $tones[($r * 3 + $c) % 4]
        $g.FillRectangle($b, $x + 8 + $c * 36, $y + 8 + $r * 36, 30, 30)
        $b.Dispose()
      }
    }
  } else {
    $glaze = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(150, 255, 255, 255))
    $g.FillEllipse($glaze, $x + 36, $y + 28, 150, 80)
    $glaze.Dispose()
    $rim = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(217, 214, 207)), 1
    $g.DrawRectangle($rim, $x + 10, $y + 10, $size - 20, $size - 20)
    $rim.Dispose()
  }

  $g.DrawRectangle($line, $x, $y, $size, $size)
  $g.DrawString($tiles[$i].name, $labelFont, $muted, $x, $y + $size + 8)
}

$g.DrawString("SHADE LOT 02", $labelFont, $ink, 64, 900)
$g.DrawString("CALIBER  0.4", $labelFont, $ink, 280, 900)
$g.DrawString("JOINT  2 mm", $labelFont, $ink, 500, 900)
$g.DrawString("SAMPLE  /  NOT A QUOTATION", $labelFont, $muted, 1088, 900)

$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Output "wrote kiln ledger"
