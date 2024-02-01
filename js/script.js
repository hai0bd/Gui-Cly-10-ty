window.onload = () => {
    const imageSrc = 'img/hia.png'; // Đường dẫn đến ảnh của bạn
    const imageAlt = 'Ảnh chèn giữa màn hình'; // Văn bản thay thế

    const img = document.createElement('img'); // Tạo một phần tử hình ảnh
    img.src = imageSrc; // Đặt đường dẫn ảnh
    img.alt = imageAlt; // Đặt văn bản thay thế
    img.classList.add('centered-image'); // Thêm lớp centered-image

    document.body.appendChild(img); // Chèn ảnh vào body của trang web

    const resizeImage = () => {
        const winWid = window.innerWidth - 100;
        const winHei = window.innerHeight - 100;

        // Tính toán kích thước mới dựa trên kích thước cửa sổ trình duyệt và các thông số phù hợp
        const newWidth = Math.min(winWid, winHei) * 0.8; // Điều chỉnh tỷ lệ theo nhu cầu
        const newHeight = (newWidth / img.naturalWidth) * img.naturalHeight;

        img.style.width = newWidth + 'px';
        img.style.height = newHeight + 'px';
    };

    // Gọi hàm resizeImage khi cửa sổ được thay đổi kích thước
    window.addEventListener('resize', resizeImage);

    // Gọi hàm resizeImage lần đầu để thiết lập kích thước ban đầu
    resizeImage();
};
var numclouds = 100, dist = 100, cloudimg = ["./img/0.png", "./img/1.png", "./img/2.png"], cloudwid = 50, cloudhei = 28, speed = 0.55, spin = 0.002;

var cloud = new Array(), moz = (document.getElementById && !document.all) ? 1 : 0;
function newCloud(x) { cloud[x] = new Array(0, Math.random() * (2 * Math.PI), Math.random() * (dist / 4)); }
function cloudsT() {
    winWid = (moz) ? window.innerWidth : document.body.clientWidth;
    winHei = (moz) ? window.innerHeight : document.body.clientHeight;
    zero = (moz) ? window.pageYOffset : document.body.scrollTop;
    for (n = 0; n < numclouds; n++) 
    {
        if (cloud.length < numclouds) 
        { 
            newCloud(n); 
            document.write('<IMG id="cloud' + n + '" src="' + cloudimg[n % 3] + '" style="position:absolute;">'); 
        }
        cloud[n][0] += speed; cloud[n][1] += spin;
        yp = (winHei / 2) + (cloud[n][0] * (Math.sin(cloud[n][1]) * cloud[n][2]));
        xp = (winWid / 2) + (cloud[n][0] * (Math.cos(cloud[n][1]) * cloud[n][2]));
        if ((cloud[n][0] >= dist) || (xp >= (winWid - cloudwid)) || (yp >= (winHei - cloudhei)) || (xp <= 0) || (yp <= 0)) { newCloud(n); }
        with (eval("document.getElementById('cloud'+n).style")) {
            top = yp + zero;
            left = xp;
            height = parseInt((cloudhei / dist) * cloud[n][0]) + "px";
            width = parseInt((cloudwid / dist) * cloud[n][0]) + "px";
        }
    }
    moving = setTimeout('cloudsT()', 30);
}
cloudsT();