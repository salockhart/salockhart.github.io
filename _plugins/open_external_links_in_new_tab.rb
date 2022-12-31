require 'nokogiri'

Jekyll::Hooks.register [:notes], :post_convert do |doc|
  convert_links(doc)
end

Jekyll::Hooks.register [:pages], :post_convert do |doc|
  # jekyll considers anything at the root as a page,
  # we only want to consider actual pages
  next unless doc.path.start_with?('_pages/')
  convert_links(doc)
end

def convert_links(doc)
  parsed_doc = Nokogiri::HTML(doc.content)
  parsed_doc.css("a:not(.internal-link):not(.footnote):not(.reversefootnote)").each do |link|
    link.set_attribute('target', '_blank')
  end
  doc.content = parsed_doc.inner_html
end
