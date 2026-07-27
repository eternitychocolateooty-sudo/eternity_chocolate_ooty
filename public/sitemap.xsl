<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap | ETERNITY Chocolates Ooty</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #0f0a07;
            color: #f3e8df;
            margin: 0;
            padding: 40px 20px;
          }
          .container {
            max-width: 960px;
            margin: 0 auto;
            background: #1a120c;
            border: 1px solid #3d291a;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          }
          h1 {
            color: #d4a373;
            font-size: 24px;
            margin-top: 0;
            margin-bottom: 8px;
          }
          p {
            color: #a89f91;
            font-size: 14px;
            margin-bottom: 24px;
            line-height: 1.5;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
          }
          th {
            background-color: #261b12;
            color: #d4a373;
            text-align: left;
            padding: 12px 16px;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #3d291a;
          }
          td {
            padding: 12px 16px;
            border-bottom: 1px solid #281c13;
            font-size: 14px;
          }
          tr:hover td {
            background-color: #241810;
          }
          a {
            color: #e6b89c;
            text-decoration: none;
            word-break: break-all;
          }
          a:hover {
            text-decoration: underline;
          }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            background: #2a1c12;
            color: #d4a373;
            font-size: 12px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>ETERNITY Chocolates Ooty — XML Sitemap</h1>
          <p>This XML Sitemap helps search engines like Google discover and index pages on <strong>eternitychocolateooty.com</strong>.</p>
          <table>
            <thead>
              <tr>
                <th>URL Location</th>
                <th>Priority</th>
                <th>Change Frequency</th>
                <th>Last Modified</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td>
                    <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                  </td>
                  <td>
                    <span class="badge"><xsl:value-of select="sitemap:priority"/></span>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:changefreq"/>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:lastmod"/>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
