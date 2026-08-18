$ErrorActionPreference = "Stop"

$testUrl = "http://127.0.0.1:3004/r/kesar-tandoor/t/798AAD90"
$storageKey = "kt-cart-kesar-tandoor-798AAD90"
$beforePath = Join-Path $env:TEMP "menuqr-order-status-chromium.png"
$afterPath = Join-Path $env:TEMP "menuqr-order-history-chromium.png"
$token = [Threading.CancellationToken]::None

function Receive-CdpMessage {
  $buffer = New-Object byte[] 65536
  $message = New-Object System.Text.StringBuilder
  do {
    $result = $script:socket.ReceiveAsync(
      [ArraySegment[byte]]::new($buffer),
      $script:token
    ).GetAwaiter().GetResult()
    [void]$message.Append([Text.Encoding]::UTF8.GetString($buffer, 0, $result.Count))
  } while (-not $result.EndOfMessage)
  return $message.ToString() | ConvertFrom-Json
}

function Invoke-Cdp {
  param(
    [string]$Method,
    [hashtable]$Params = @{}
  )

  $id = $script:nextMessageId
  $script:nextMessageId += 1
  $body = @{ id = $id; method = $Method; params = $Params } | ConvertTo-Json -Compress -Depth 12
  $bytes = [Text.Encoding]::UTF8.GetBytes($body)
  $script:socket.SendAsync(
    [ArraySegment[byte]]::new($bytes),
    [Net.WebSockets.WebSocketMessageType]::Text,
    $true,
    $script:token
  ).GetAwaiter().GetResult()

  do {
    $response = Receive-CdpMessage
  } while ($response.id -ne $id)

  if ($response.error) { throw $response.error.message }
  return $response
}

$targets = (Invoke-RestMethod -Uri "http://127.0.0.1:9222/json/list").value
$page = $targets | Where-Object { $_.type -eq "page" -and $_.url -eq "about:blank" } | Select-Object -First 1
if (-not $page) { throw "Chromium test page was not found." }

$script:socket = [Net.WebSockets.ClientWebSocket]::new()
$script:token = $token
$script:nextMessageId = 1
$script:socket.ConnectAsync([Uri]$page.webSocketDebuggerUrl, $token).GetAwaiter().GetResult()

try {
  Invoke-Cdp "Page.enable" | Out-Null
  Invoke-Cdp "Page.navigate" @{ url = $testUrl } | Out-Null
  Start-Sleep -Seconds 3

  $state = @{
    lines = @()
    stage = $null
    orderId = $null
    placedLines = @()
    waiterCalledAt = $null
    waiterReason = $null
    orderDbId = $null
    offer = $null
    sessionId = "chromium-ui-test"
    guests = 2
    customer = $null
    mode = "dinein"
    tableToken = "798AAD90"
    pickup = $null
    history = @()
    activeOrders = @(
      @{
        code = "T-3059"
        orderDbId = "chromium-ticket-3059"
        placedAt = [DateTimeOffset]::UtcNow.AddMinutes(-5).ToUnixTimeMilliseconds()
        mode = "dinein"
        tableNumber = "1"
        total = 650
        stage = "served"
        lines = @(
          @{ lineId = "paneer-tikka"; itemId = "paneer-tikka"; name = "Paneer Tikka"; diet = "veg"; unitPrice = 340; qty = 1; optionIds = @(); optionLabels = @("Mild") },
          @{ lineId = "dahi-kebab"; itemId = "dahi-kebab"; name = "Dahi Ke Kebab"; diet = "veg"; unitPrice = 310; qty = 1; optionIds = @(); optionLabels = @() }
        )
      },
      @{
        code = "T-3060"
        orderDbId = "chromium-ticket-3060"
        placedAt = [DateTimeOffset]::UtcNow.AddMinutes(-2).ToUnixTimeMilliseconds()
        mode = "dinein"
        tableNumber = "1"
        total = 340
        stage = "preparing"
        lines = @(
          @{ lineId = "paneer-tikka-repeat"; itemId = "paneer-tikka"; name = "Paneer Tikka"; diet = "veg"; unitPrice = 340; qty = 1; optionIds = @(); optionLabels = @("Mild") }
        )
      }
    )
    fromRepeat = $false
  }

  $json = $state | ConvertTo-Json -Compress -Depth 12
  $encodedState = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($json))
  Invoke-Cdp "Runtime.evaluate" @{
    expression = "localStorage.setItem('$storageKey', atob('$encodedState')); location.reload(); 'state-seeded';"
    awaitPromise = $true
  } | Out-Null
  Start-Sleep -Seconds 4

  Invoke-Cdp "Runtime.evaluate" @{
    expression = "const button=[...document.querySelectorAll('button')].find((node)=>node.textContent.includes('2 orders'));if(!button)throw new Error('Open status button not found');button.click();'status-opened';"
    awaitPromise = $true
  } | Out-Null
  Start-Sleep -Milliseconds 800

  $before = Invoke-Cdp "Page.captureScreenshot" @{ format = "png" }
  [IO.File]::WriteAllBytes($beforePath, [Convert]::FromBase64String($before.result.data))

  Invoke-Cdp "Runtime.evaluate" @{
    expression = "window.fetch=async()=>new Response(JSON.stringify({ok:true}),{status:200,headers:{'Content-Type':'application/json'}});const button=[...document.querySelectorAll('button')].find((node)=>node.textContent.trim()==='Checkout');if(!button)throw new Error('Checkout button not found');button.click();'checkout-clicked';"
    awaitPromise = $true
  } | Out-Null
  Start-Sleep -Milliseconds 800

  $after = Invoke-Cdp "Page.captureScreenshot" @{ format = "png" }
  [IO.File]::WriteAllBytes($afterPath, [Convert]::FromBase64String($after.result.data))

  @{ before = $beforePath; after = $afterPath } | ConvertTo-Json -Compress
} finally {
  $script:socket.Dispose()
}
