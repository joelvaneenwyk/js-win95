<#
.SYNOPSIS
    Download the 'windows95.img' file from URL provided in environment.
#>

$script_path = Split-Path -Parent $MyInvocation.MyCommand.Definition
$emulator_root_path = $script_path
# keep going up until we find the root of the emulator
while (-not [string]::IsNullOrWhiteSpace($emulator_root_path) -and (Test-Path "$emulator_root_path/forge.config.js") -eq $false) {
    $emulator_root_path = Split-Path -Parent $emulator_root_path
}
$env_path = Join-Path $emulator_root_path ".env"

# Check if '.env' exists and then load it
if (Test-Path $env_path) {
    Write-Host "Loading environment variables file: '$env_path'"
    get-content -Path "$env_path" | ForEach-Object {
        try {
            $line = $_
            if (-not [string]::IsNullOrWhiteSpace($line)) {
                # Only try to set if it doesn't start with # sign
                $line = $line.Trim().Trim('"')
                if (-not $line.Trim().StartsWith("#")) {
                    $name, $value = $line.split('=')
                    $variable_name = $name.Trim('"').Trim()
                    $variable_value = $value.Trim('"').Trim()
                    Set-Item -Path $("Env:\$variable_name") -Value $variable_value -ErrorAction SilentlyContinue
                    Write-Host "Loaded variable: '$variable_name'"
                }
            }
        }
        catch {
            Write-Debug "Failed to read environment variable. $_"
        }
    }
}
else {
    Write-Host "$($env_path) not found"
    exit 1
}

$disk_url = if ($env:DISK_URL) {$env:DISK_URL} else {""}

$images_path = Join-Path $emulator_root_path "images"
$images_target_archive = Join-Path $images_path "images.zip"

# Make 'images' directory if it doesn't exist
if (-not (Test-Path $images_path)) {
    New-Item -ItemType Directory -Path $images_path
}

if (Test-Path $images_target_archive) {
    Remove-Item "$images_target_archive"
    Write-Host "Removed existing archive: '$images_target_archive'"
}

$out_file_path = "$($images_target_archive -replace "[$([RegEx]::Escape([string][IO.Path]::GetInvalidPathChars()))]+","_")"

if ([string]::IsNullOrWhiteSpace($disk_url)) {
    Write-Error "Disk URL is not provided. Please set 'DISK_URL' environment variable."
    exit 20
}

try {
    Write-Host "Disk URL: '$disk_url'"
    Write-Host "Target Path: '$out_file_path'"
    Invoke-WebRequest "$disk_url" -OutFile "$out_file_path"
}
catch {
    Write-Error "Download failed with 'Invoke-WebRequest' command. Error: $_"
    try {
        Write-Host "Trying to download with 'System.Net.WebClient' module..."
        $wc = New-Object System.Net.WebClient
        $wc.DownloadFile($disk_url, $out_file_path)
    }
    catch {
        Write-Error "Download failed with 'System.Net.WebClient' module. Error: $_"
        try {
            Write-Host "Trying to download with 'BitsTransfer' module..."
            Import-Module BitsTransfer
            Start-BitsTransfer -Source $disk_url -Destination $out_file_path
        }
        catch {
            Write-Error "Download failed with 'BitsTransfer' module. Error: $_"
            exit 21
        }
        finally {
        }
    }
}
finally {
    if (Test-Path $images_target_archive) {
        Write-Information "Downloaded disk image: '$out_file_path'"
        7z x "$images_target_archive" -o"$images_path" -y -aoa
        Remove-Item "$images_path/__MACOSX" -Recurse -ErrorAction Ignore
        Remove-Item "$images_target_archive"
        Write-Host "Removed existing archive: '$images_target_archive'"
    } else {
        Write-Error "Failed to download disk image from $disk_url"
        exit 22
    }
}


