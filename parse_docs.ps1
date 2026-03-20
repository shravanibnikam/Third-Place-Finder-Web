param($File)

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($File)
$entry = $zip.GetEntry('word/document.xml')
$reader = new-object System.IO.StreamReader($entry.Open())
$xmlString = $reader.ReadToEnd()
$reader.Close()
$zip.Dispose()

$xml = [xml]$xmlString
$ns = new-object Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')
$nodes = $xml.SelectNodes('//w:p', $ns)
foreach ($node in $nodes) {
    $text = ''
    foreach ($t in $node.SelectNodes('.//w:t', $ns)) {
        $text += $t.InnerText
    }
    if ($text -ne '') {
        Write-Output $text
    }
}
