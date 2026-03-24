import urllib.request
import urllib.parse
import json
import os

def download_wiki_image(query, filename):
    url = f"https://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&generator=images&gimlimit=5&titles={urllib.parse.quote(query)}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            pages = data.get('query', {}).get('pages', {})
            for page_id, page_info in pages.items():
                imageinfo = page_info.get('imageinfo', [])
                if imageinfo:
                    img_url = imageinfo[0].get('url')
                    if img_url and (img_url.endswith('.svg') or img_url.endswith('.png')):
                        print(f"Downloading {img_url} to {filename}")
                        req_img = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
                        with urllib.request.urlopen(req_img) as img_response:
                            with open(filename, 'wb') as f:
                                f.write(img_response.read())
                        return True
            print(f"No valid image found for {query}")
            return False
    except Exception as e:
        print(f"Error: {e}")
        return False

os.makedirs(r"c:\Users\Mustafa Sezen\Desktop\4.Sınıf Çalışmalarım\İME ÇALIŞMALARI\API\tug-enter\frontend\public", exist_ok=True)
download_wiki_image("TÜBİTAK", r"c:\Users\Mustafa Sezen\Desktop\4.Sınıf Çalışmalarım\İME ÇALIŞMALARI\API\tug-enter\frontend\public\tubitak-logo.svg")
download_wiki_image("Atatürk_University", r"c:\Users\Mustafa Sezen\Desktop\4.Sınıf Çalışmalarım\İME ÇALIŞMALARI\API\tug-enter\frontend\public\atauni-logo.svg")
