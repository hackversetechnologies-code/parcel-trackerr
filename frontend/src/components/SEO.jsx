import { Helmet } from 'react-helmet-async';

export function SEO({ 
  title = 'SwiftShip - Fast & Reliable Delivery Service',
  description = 'Track your parcels in real-time with SwiftShip. Fast, reliable, and secure delivery service with live tracking, notifications, and excellent customer support.',
  keywords = 'delivery service, parcel tracking, logistics, shipping, courier',
  image = '/logo.png',
  url = 'https://swiftship.app',
  type = 'website'
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SwiftShip",
    "url": url,
    "logo": `${url}${image}`,
    "description": description,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-800-SWIFTSHIP",
      "contactType": "customer service",
      "areaServed": "US",
      "availableLanguage": "English"
    },
    "sameAs": [
      "https://twitter.com/swiftship",
      "https://facebook.com/swiftship",
      "https://instagram.com/swiftship"
    ]
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${url}${image}`} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${url}${image}`} />
      <link rel="canonical" href={url} />
      
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}

export function TrackingSEO({ trackingId, parcel }) {
  return (
    <SEO
      title={`Track Parcel ${trackingId} - SwiftShip`}
      description={`Track your SwiftShip parcel ${trackingId}. Current status: ${parcel?.status || 'In Transit'}. Get real-time updates and estimated delivery time.`}
      keywords={`parcel tracking, ${trackingId}, delivery tracking, SwiftShip`}
      url={`https://swiftship.app/tracking?trackingId=${trackingId}`}
    />
  );
}
