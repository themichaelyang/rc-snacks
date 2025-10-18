To print a receipt:

1. Open console on RC selfie
2. Take a receipt selfie
3. Copy as curl (so it comes with the cookies)
4. `ruby receipt.rb` to make the binary command file
5. Replace `--data-raw` with `--data-binary @receipt.bin`
6. Add some lines after the receipt: `printf "\n\r\n\r\n\r\n\r\n\r" >> receipt.bin`
7. Call curl command
8. Call the cut receipt command over `nc receipt.local 23`, `^[i` (`ESC[i`); or, attach `printf '\x1bi\n' >> receipt.bin` (`\x1b\x69\x0a`)
