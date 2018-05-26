<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes" />
  <xsl:template match="/">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>XML Sitemap</title>
  <link rel="stylesheet" type="text/css" href="/wp-content/plugins/base-theme-class/sitemap.css" />
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="robots" content="noindex,follow" />
</head>
<body>
<header>
<h1>XML Sitemap</h1>
  <p>This is a XML Sitemap which is supposed to be processed by search engines.</p>
</header>
<main>
<xsl:apply-templates></xsl:apply-templates>
</main>
<footer>
  Generated with <a rel="external nofollow" href="http://www.arnebrachhold.de/redir/sitemap-home/" title="Google (XML) Sitemap Generator Plugin for WordPress">Google (XML) Sitemaps Generator Plugin for WordPress</a> by <a rel="external nofollow" href="http://www.arnebrachhold.de/">Arne Brachhold</a>.
</footer>
  </body>
</html>
  </xsl:template>
  
  <xsl:template match="sitemap:urlset">
<table>
  <thead>
    <tr>
      <th>URL</th>
      <th>Priority</th>
      <th>Updates</th>
      <th>Last mod (GMT)</th>
    </tr>
  </thead>
  <xsl:variable name="lower" select="'abcdefghijklmnopqrstuvwxyz'"/>
  <xsl:variable name="upper" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"/>
  <tbody>
  <xsl:for-each select="./sitemap:url">
    <tr>
      <td>
        <xsl:variable name="itemURL"><xsl:value-of select="sitemap:loc"/></xsl:variable>
        <a href="{$itemURL}"><xsl:value-of select="sitemap:loc"/></a>
      </td>
      <td>
        <xsl:value-of select="concat(sitemap:priority*100,'%')"/>
      </td>
      <td>
        <xsl:value-of select="concat(translate(substring(sitemap:changefreq, 1, 1),concat($lower, $upper),concat($upper, $lower)),substring(sitemap:changefreq, 2))"/>
      </td>
      <td>
        <xsl:value-of select="concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)))"/>
      </td>
    </tr>
  </xsl:for-each>
  </tbody>
</table>
  </xsl:template>
  <xsl:template match="sitemap:sitemapindex">
<table>
  <thead>
    <tr>
      <th>URL of sub-sitemap</th>
      <th>Last mod (GMT)</th>
    </tr>
  </thead>
  <tbody>
    <xsl:for-each select="./sitemap:sitemap">
    <tr>
      <td>
        <xsl:variable name="itemURL"><xsl:value-of select="sitemap:loc"/></xsl:variable>
        <a href="{$itemURL}"><xsl:value-of select="sitemap:loc"/></a>
      </td>
      <td>
        <xsl:value-of select="concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)))"/>
      </td>
    </tr>
    </xsl:for-each>
  </tbody>
</table>
  </xsl:template>
</xsl:stylesheet>
