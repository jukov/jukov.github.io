    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/android/i.test(userAgent)) {
        window.location = "https://play.google.com/store/apps/details?id=info.jukov.merger";
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        window.location = "https://apps.apple.com/app/combohex/id6448719446";
    } else {
        window.location = "https://jukov.info/combohex/store";
    }

