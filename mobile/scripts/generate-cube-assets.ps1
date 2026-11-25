Add-Type -AssemblyName System.Drawing

$OutDir = Join-Path $PSScriptRoot "..\assets\images"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

function Hex([string]$h) {
  $h = $h.TrimStart('#')
  return [System.Drawing.Color]::FromArgb(255,
    [Convert]::ToInt32($h.Substring(0, 2), 16),
    [Convert]::ToInt32($h.Substring(2, 2), 16),
    [Convert]::ToInt32($h.Substring(4, 2), 16))
}

function AddP([System.Drawing.PointF]$a, [float]$x, [float]$y) {
  return New-Object System.Drawing.PointF(($a.X + $x), ($a.Y + $y))
}

function DrawFace(
  [System.Drawing.Graphics]$g,
  [System.Drawing.PointF]$o,
  [float]$ax, [float]$ay,
  [float]$bx, [float]$by,
  [System.Drawing.Color]$sticker,
  [System.Drawing.Color]$plastic
) {
  $full = @(
    $o,
    (AddP $o $ax $ay),
    (AddP $o ($ax + $bx) ($ay + $by)),
    (AddP $o $bx $by)
  )
  $pb = New-Object System.Drawing.SolidBrush $plastic
  $g.FillPolygon($pb, $full)
  $pb.Dispose()

  $sb = New-Object System.Drawing.SolidBrush $sticker
  $gap = 0.07
  $inner = (1.0 / 3.0) - (2.0 * $gap / 3.0)
  for ($i = 0; $i -lt 3; $i++) {
    for ($j = 0; $j -lt 3; $j++) {
      $s0 = ($i / 3.0) + ($gap / 3.0)
      $t0 = ($j / 3.0) + ($gap / 3.0)
      $p0 = AddP $o ($ax * $s0 + $bx * $t0) ($ay * $s0 + $by * $t0)
      $p1 = AddP $p0 ($ax * $inner) ($ay * $inner)
      $p2 = AddP $p0 ($ax * $inner + $bx * $inner) ($ay * $inner + $by * $inner)
      $p3 = AddP $p0 ($bx * $inner) ($by * $inner)
      $g.FillPolygon($sb, @($p0, $p1, $p2, $p3))
    }
  }
  $sb.Dispose()
}

function DrawCube(
  [System.Drawing.Graphics]$g,
  [float]$cx, [float]$cy, [float]$size,
  [System.Drawing.Color]$u, [System.Drawing.Color]$f, [System.Drawing.Color]$r,
  [System.Drawing.Color]$plastic,
  [bool]$mono
) {
  $ux = [float]($size * 0.8660254)
  $uy = [float]($size * 0.5)
  $C = New-Object System.Drawing.PointF($cx, $cy)
  $L = New-Object System.Drawing.PointF(($cx - $ux), ($cy - $uy))
  $T = New-Object System.Drawing.PointF($cx, ($cy - $size))
  $Rpt = New-Object System.Drawing.PointF(($cx + $ux), ($cy - $uy))

  $uCol = if ($mono) { $plastic } else { $u }
  $fCol = if ($mono) { [System.Drawing.Color]::FromArgb(255, 90, 90, 90) } else { $f }
  $rCol = if ($mono) { [System.Drawing.Color]::FromArgb(255, 40, 40, 40) } else { $r }

  DrawFace $g $T ($Rpt.X - $T.X) ($Rpt.Y - $T.Y) ($L.X - $T.X) ($L.Y - $T.Y) $uCol $plastic
  DrawFace $g $L ($C.X - $L.X) ($C.Y - $L.Y) 0 $size $fCol $plastic
  DrawFace $g $C ($Rpt.X - $C.X) ($Rpt.Y - $C.Y) 0 $size $rCol $plastic
}

function SavePng([System.Drawing.Bitmap]$bmp, [string]$name) {
  $path = Join-Path $OutDir $name
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  Write-Host "wrote $path"
}

$U = Hex 'facc15'
$F = Hex '22c55e'
$R = Hex 'f97316'
$Plastic = Hex '1c232d'
$Cream = Hex 'f5f3ee'
$Dark = Hex '12161c'

function NewCubeBitmap([int]$dim, [System.Drawing.Color]$bg, [bool]$transparent, [float]$scale, [bool]$mono) {
  $bmp = New-Object System.Drawing.Bitmap $dim, $dim, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
  $g.Clear($(if ($transparent) { [System.Drawing.Color]::FromArgb(0, 0, 0, 0) } else { $bg }))
  $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
  $size = [float]($dim * $scale)
  DrawCube $g ($dim / 2.0) ($dim * 0.58) $size $U $F $R $Plastic $mono
  $g.Dispose()
  return $bmp
}

$icon = NewCubeBitmap 1024 $Cream $false 0.38 $false
SavePng $icon 'icon.png'
$icon.Dispose()

$splash = NewCubeBitmap 1024 $Cream $false 0.42 $false
SavePng $splash 'splash-icon.png'
$splash.Dispose()

$fg = NewCubeBitmap 1024 $Cream $true 0.34 $false
SavePng $fg 'android-icon-foreground.png'
$fg.Dispose()

$bg = New-Object System.Drawing.Bitmap 1024, 1024
$gbg = [System.Drawing.Graphics]::FromImage($bg)
$gbg.Clear($Cream)
$gbg.Dispose()
SavePng $bg 'android-icon-background.png'
$bg.Dispose()

$mono = NewCubeBitmap 1024 $Cream $true 0.34 $true
SavePng $mono 'android-icon-monochrome.png'
$mono.Dispose()

$fav = NewCubeBitmap 64 $Cream $false 0.40 $false
SavePng $fav 'favicon.png'
$fav.Dispose()

Write-Host 'cube assets ready'
