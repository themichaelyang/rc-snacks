require 'escpos'
require 'escpos/image'

@printer = Escpos::Printer.new
image = Escpos::Image.new 'receipt.png', { processor: "ChunkyPng", extent: true }
@printer << image
File.open('receipt.bin', 'w') do |f|
  f.write(@printer.to_escpos)
end
