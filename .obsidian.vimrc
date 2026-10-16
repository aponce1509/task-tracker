nmap j gj
nmap k gk

vmap j gj
vmap k gk

imap jj <Esc>

nmap H ^
nmap L $

vmap H ^
vmap L $

" Maps pasteinto to Alt-p
map <A-p> :pasteinto

set clipboard=unnamed

" --- Leaders (Mise-en-Place plugin) ---
" <Space> and \ open the which-key popup; the keys live in
" 99 - Meta/mise-en-place.jsonc (formatting moved to \ b, \ m, \ c, \ k).
exmap leader obcommand mise-en-place:leader
exmap localleader obcommand mise-en-place:localleader
nmap <Space> :leader<CR>
vmap <Space> :leader<CR>
nmap \ :localleader<CR>
vmap \ :localleader<CR>

" Emulate Folding https://vimhelp.org/fold.txt.html#fold-commands
exmap togglefold obcommand editor:toggle-fold
nmap zo :togglefold<CR>
nmap zc :togglefold<CR>
nmap za :togglefold<CR>

exmap unfoldall obcommand editor:unfold-all
nmap zR :unfoldall<CR>

exmap foldall obcommand editor:fold-all
nmap zM :foldall<CR>

exmap tabnext obcommand workspace:next-tab
nmap gt :tabnext<CR>
exmap tabprev obcommand workspace:previous-tab
nmap gT :tabprev<CR>

exmap surround_wiki surround [[ ]]
exmap surround_double_quotes surround " "
exmap surround_single_quotes surround ' '
exmap surround_backticks surround ` `
exmap surround_brackets surround ( )
exmap surround_square_brackets surround [ ]
exmap surround_curly_brackets surround { }

" NOTE: must use 'map' and not 'nmap'
map [[ :surround_wiki<CR>
nunmap s
vunmap s
map s" :surround_double_quotes<CR>
map s' :surround_single_quotes<CR>
map s` :surround_backticks<CR>
map sb :surround_brackets<CR>
map s( :surround_brackets<CR>
map s) :surround_brackets<CR>
map s[ :surround_square_brackets<CR>
map s] :surround_square_brackets<CR>
map s{ :surround_curly_brackets<CR>
map s} :surround_curly_brackets<CR>