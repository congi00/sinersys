// app/video-sitemap.xml/route.ts
export async function GET() {
    const videos = [
      {
        loc: 'https://www.sinersys.it/it/apwec-energia-rinnovabile',
        title: 'APWEC — Autonomous Perpetual Wave Energy Converter',
        description: 'Prototipo APWEC in funzione, generatore di energia rinnovabile.',
        thumbnail: 'https://www.sinersys.it/full-logo-sinersys_blu.png',
        contentUrl: 'https://www.sinersys.it/apwecprod_fixed_w.mp4',
        durationSeconds: 6,
      },{
        loc: 'https://www.sinersys.it/it/apwec-energia-rinnovabile',
        title: 'APWEC — Autonomous Perpetual Wave Energy Converter',
        description: 'Prototipo APWEC in funzione, generatore di energia rinnovabile.',
        thumbnail: 'https://www.sinersys.it/full-logo-sinersys_blu.png',
        contentUrl: 'https://www.sinersys.it/apwecprod_fixed_w1.mp4',
        durationSeconds: 5,
      },{
        loc: 'https://www.sinersys.it/it/apwec-energia-rinnovabile',
        title: 'APWEC — Autonomous Perpetual Wave Energy Converter',
        description: 'Prototipo APWEC in funzione, generatore di energia rinnovabile.',
        thumbnail: 'https://www.sinersys.it/full-logo-sinersys_blu.png',
        contentUrl: 'https://www.sinersys.it/apwecprod_fixed_w2.mp4',
        durationSeconds: 5,
      },
      {
        loc: 'https://www.sinersys.it/it/',
        title: 'APWEC — Autonomous Perpetual Wave Energy Converter',
        description: 'Presentazione prototipo APWEC, generatore di energia rinnovabile.',
        thumbnail: 'https://www.sinersys.it/full-logo-sinersys_blu.png',
        contentUrl: 'https://www.sinersys.it/apwecintro.mp4',
        durationSeconds: 15,
      },{
        loc: 'https://www.sinersys.it/it/',
        title: 'APWEC — Autonomous Perpetual Wave Energy Converter',
        description: 'Presentazione prototipo APWEC, generatore di energia rinnovabile.',
        thumbnail: 'https://www.sinersys.it/full-logo-sinersys_blu.png',
        contentUrl: 'https://www.sinersys.it/apwecintro1.mp4',
        durationSeconds: 15,
      },
      {
        loc: 'https://www.sinersys.it/en/apwec-energia-rinnovabile',
        title: 'APWEC — Autonomous Perpetual Wave Energy Converter',
        description: 'APWEC prototype in operation, renewable energy generator.',
        thumbnail: 'https://www.sinersys.it/full-logo-sinersys_blu.png',
        contentUrl: 'https://www.sinersys.it/apwecprod_fixed_w.mp4',
        durationSeconds: 6,
      },
      {
        loc: 'https://www.sinersys.it/en/apwec-energia-rinnovabile',
        title: 'APWEC — Autonomous Perpetual Wave Energy Converter',
        description: 'APWEC prototype in operation, renewable energy generator.',
        thumbnail: 'https://www.sinersys.it/full-logo-sinersys_blu.png',
        contentUrl: 'https://www.sinersys.it/apwecprod_fixed_w1.mp4',
        durationSeconds: 5,
      },
      {
        loc: 'https://www.sinersys.it/en/apwec-energia-rinnovabile',
        title: 'APWEC — Autonomous Perpetual Wave Energy Converter',
        description: 'APWEC prototype in operation, renewable energy generator.',
        thumbnail: 'https://www.sinersys.it/full-logo-sinersys_blu.png',
        contentUrl: 'https://www.sinersys.it/apwecprod_fixed_w2.mp4',
        durationSeconds: 5,
      },
      {
        loc: 'https://www.sinersys.it/en/',
        title: 'APWEC — Autonomous Perpetual Wave Energy Converter',
        description: 'Presentation of the APWEC prototype, renewable energy generator.',
        thumbnail: 'https://www.sinersys.it/full-logo-sinersys_blu.png',
        contentUrl: 'https://www.sinersys.it/apwecintro.mp4',
        durationSeconds: 15,
      },
      {
        loc: 'https://www.sinersys.it/en/',
        title: 'APWEC — Autonomous Perpetual Wave Energy Converter',
        description: 'Presentation of the APWEC prototype, renewable energy generator.',
        thumbnail: 'https://www.sinersys.it/full-logo-sinersys_blu.png',
        contentUrl: 'https://www.sinersys.it/apwecintro1.mp4',
        durationSeconds: 15,
      },
      
      {
        loc: 'https://www.sinersys.it/de/apwec-energia-rinnovabile',
        title: 'APWEC — Autonomer permanenter Wellenenergie-Konverter',
        description: 'APWEC-Prototyp im Betrieb, Generator für erneuerbare Energien.',
        thumbnail: 'https://www.sinersys.it/full-logo-sinersys_blu.png',
        contentUrl: 'https://www.sinersys.it/apwecprod_fixed_w.mp4',
        durationSeconds: 6,
      },
      {
        loc: 'https://www.sinersys.it/de/apwec-energia-rinnovabile',
        title: 'APWEC — Autonomer permanenter Wellenenergie-Konverter',
        description: 'APWEC-Prototyp im Betrieb, Generator für erneuerbare Energien.',
        thumbnail: 'https://www.sinersys.it/full-logo-sinersys_blu.png',
        contentUrl: 'https://www.sinersys.it/apwecprod_fixed_w1.mp4',
        durationSeconds: 5,
      },
      {
        loc: 'https://www.sinersys.it/de/apwec-energia-rinnovabile',
        title: 'APWEC — Autonomer permanenter Wellenenergie-Konverter',
        description: 'APWEC-Prototyp im Betrieb, Generator für erneuerbare Energien.',
        thumbnail: 'https://www.sinersys.it/full-logo-sinersys_blu.png',
        contentUrl: 'https://www.sinersys.it/apwecprod_fixed_w2.mp4',
        durationSeconds: 5,
      },
      {
        loc: 'https://www.sinersys.it/de/',
        title: 'APWEC — Autonomer permanenter Wellenenergie-Konverter',
        description: 'Präsentation des APWEC-Prototyps, Generator für erneuerbare Energien.',
        thumbnail: 'https://www.sinersys.it/full-logo-sinersys_blu.png',
        contentUrl: 'https://www.sinersys.it/apwecintro.mp4',
        durationSeconds: 15,
      },
      {
        loc: 'https://www.sinersys.it/de/',
        title: 'APWEC — Autonomer permanenter Wellenenergie-Konverter',
        description: 'Präsentation des APWEC-Prototyps, Generator für erneuerbare Energien.',
        thumbnail: 'https://www.sinersys.it/full-logo-sinersys_blu.png',
        contentUrl: 'https://www.sinersys.it/apwecintro1.mp4',
        durationSeconds: 15,
      },
      
      {
        loc: 'https://www.sinersys.it/fr/apwec-energia-rinnovabile',
        title: 'APWEC — Convertisseur autonome à énergie houlomotrice permanente',
        description: "Prototype APWEC en fonctionnement, générateur d'énergie renouvelable.",
        thumbnail: 'https://www.sinersys.it/full-logo-sinersys_blu.png',
        contentUrl: 'https://www.sinersys.it/apwecprod_fixed_w.mp4',
        durationSeconds: 6,
      },
      {
        loc: 'https://www.sinersys.it/fr/apwec-energia-rinnovabile',
        title: 'APWEC — Convertisseur autonome à énergie houlomotrice permanente',
        description: "Prototype APWEC en fonctionnement, générateur d'énergie renouvelable.",
        thumbnail: 'https://www.sinersys.it/full-logo-sinersys_blu.png',
        contentUrl: 'https://www.sinersys.it/apwecprod_fixed_w1.mp4',
        durationSeconds: 5,
      },
      {
        loc: 'https://www.sinersys.it/fr/apwec-energia-rinnovabile',
        title: 'APWEC — Convertisseur autonome à énergie houlomotrice permanente',
        description: "Prototype APWEC en fonctionnement, générateur d'énergie renouvelable.",
        thumbnail: 'https://www.sinersys.it/full-logo-sinersys_blu.png',
        contentUrl: 'https://www.sinersys.it/apwecprod_fixed_w2.mp4',
        durationSeconds: 5,
      },
      {
        loc: 'https://www.sinersys.it/fr/',
        title: 'APWEC — Convertisseur autonome à énergie houlomotrice permanente',
        description: "Présentation du prototype APWEC, générateur d'énergie renouvelable.",
        thumbnail: 'https://www.sinersys.it/full-logo-sinersys_blu.png',
        contentUrl: 'https://www.sinersys.it/apwecintro.mp4',
        durationSeconds: 15,
      },
      {
        loc: 'https://www.sinersys.it/fr/',
        title: 'APWEC — Convertisseur autonome à énergie houlomotrice permanente',
        description: "Présentation du prototype APWEC, générateur d'énergie renouvelable.",
        thumbnail: 'https://www.sinersys.it/full-logo-sinersys_blu.png',
        contentUrl: 'https://www.sinersys.it/apwecintro1.mp4',
        durationSeconds: 15,
      },
    ];
  
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
          xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  ${videos.map(v => `  <url>
      <loc>${v.loc}</loc>
      <video:video>
        <video:thumbnail_loc>${v.thumbnail}</video:thumbnail_loc>
        <video:title>${v.title}</video:title>
        <video:description>${v.description}</video:description>
        <video:content_loc>${v.contentUrl}</video:content_loc>
        <video:duration>${v.durationSeconds}</video:duration>
      </video:video>
    </url>`).join('\n')}
  </urlset>`;
  
    return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
  }