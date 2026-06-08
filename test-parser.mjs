const html = `<shortcode>[blog-posts style="style-1" category_ids="1,2" limit="2" background_color="transparent" enable_lazy_loading="no"][/blog-posts]</shortcode>`;

  const shortcodeRegex = /\[([a-zA-Z0-9_-]+)([^\]]*)\](.*?)\[\/\1\]|\[([a-zA-Z0-9_-]+)([^\]]*)\]/gs;

  let lastIndex = 0;
  let match;

  while ((match = shortcodeRegex.exec(html)) !== null) {
      console.log('Match:', match[1] || match[4]);
  }
