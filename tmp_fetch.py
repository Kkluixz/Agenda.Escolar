import urllib.request
url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRwSwM184YoSOYWPyfVY-9Y7cHK1IE6-eH6-LEK-IAO8FtI3qf3dBxYtVAtY_EYd-TfU7LPg0ybqzvD/pubhtml'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
res = urllib.request.urlopen(req)
html = res.read().decode('utf-8', errors='replace')
print(html[:5000])
print('--- len', len(html))
print('table count', html.lower().count('<table'))
