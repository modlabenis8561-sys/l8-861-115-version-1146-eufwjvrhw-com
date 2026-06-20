import { H as Hls } from "./video-vendor.js";

export function setupPlayer(options) {
    const video = document.querySelector(options.selector);
    const button = document.querySelector(options.buttonSelector);
    const cover = document.querySelector(options.coverSelector);
    let attached = false;
    let requested = false;
    let hls = null;

    function attach() {
        if (!video || attached) {
            return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = options.source;
            return;
        }

        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(options.source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                if (requested) {
                    video.play().catch(function () {});
                }
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                }
            });
            return;
        }

        video.src = options.source;
    }

    function start() {
        if (!video) {
            return;
        }

        requested = true;
        attach();
        video.controls = true;

        if (cover) {
            cover.classList.add("is-hidden");
        }

        video.play().catch(function () {});
    }

    if (button) {
        button.addEventListener("click", start);
    }

    if (cover) {
        cover.addEventListener("click", start);
    }

    if (video) {
        video.addEventListener("click", function () {
            if (!attached) {
                start();
            }
        });
    }
}
