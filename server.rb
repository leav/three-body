#encoding:utf-8

require 'webrick'

root = Dir.pwd
server = WEBrick::HTTPServer.new(
  :Port => 8000,
  :DocumentRoot => root,
)

trap('INT') { server.stop }
server.start