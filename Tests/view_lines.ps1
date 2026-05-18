$path = "c:\Users\Musta\OneDrive\Desktop\Mustafo - Frontend\Diagnostika-TEST\Tests\index.html"
$lines = Get-Content $path
for ($i = 540; $i -lt 660; $i++) {
    $line = $lines[$i]
    if ($line.Length -gt 200) {
        Write-Host "$($i+1): $($line.Substring(0, 200))..."
    } else {
        Write-Host "$($i+1): $line"
    }
}
