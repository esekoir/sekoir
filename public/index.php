<?php
/**
 * E-Sekoir - Main Entry Point
 * This file serves as the main entry point for the SPA
 */
?>
<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>E-Sekoir | أسعار صرف العملات في السكوار الجزائري - تحديث لحظي</title>
    <meta name="description" content="منصة E-Sekoir لأسعار صرف العملات في السوق الموازية الجزائرية. تحديث مباشر للدولار، اليورو، الجنيه، العملات الرقمية والذهب. أفضل أسعار الصرف في الجزائر." />
    <meta name="keywords" content="سعر الصرف, السكوار, الجزائر, الدولار, اليورو, العملات الرقمية, الذهب, سعر الذهب, bitcoin, تحويل العملات, أسعار العملات" />
    <meta name="author" content="E-Sekoir" />
    <meta name="robots" content="index, follow" />
    
    <!-- Preconnect for performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="E-Sekoir | أسعار صرف العملات في السكوار الجزائري" />
    <meta property="og:description" content="منصة شاملة لأسعار صرف العملات والذهب والعملات الرقمية في السوق الموازية الجزائرية. تحديث لحظي ومباشر." />
    <meta property="og:image" content="/og-image.png" />
    <meta property="og:locale" content="ar_DZ" />
    <meta property="og:site_name" content="E-Sekoir" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="E-Sekoir | أسعار صرف العملات في السكوار" />
    <meta name="twitter:description" content="تحديث مباشر لأسعار صرف العملات في السوق الموازية الجزائرية" />
    <meta name="twitter:image" content="/og-image.png" />

    <!-- Structured Data / JSON-LD -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "E-Sekoir",
      "description": "منصة لأسعار صرف العملات في السوق الموازية الجزائرية",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "DZD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "1250"
      }
    }
    </script>
    
    <!-- Theme Color -->
    <meta name="theme-color" content="#10b981" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    
    <!-- Google Identity Services for OAuth -->
    <script src="https://accounts.google.com/gsi/client" async defer></script>
    
    <!-- Load built assets -->
    <link rel="stylesheet" href="/assets/index.css">
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/assets/index.js"></script>
  </body>
</html>
