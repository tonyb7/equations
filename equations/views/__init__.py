from equations.views.index import show_favicon
from equations.views.index import show_index
from equations.views.index import show_game

from equations.views.accounts import show_login
from equations.views.accounts import show_logout
from equations.views.accounts import show_create

from equations.views.networking import on_connect
from equations.views.networking import on_disconnect
from equations.views.networking import register_player
from equations.views.networking import handle_start_game
from equations.views.networking import handle_flip_timer
from equations.views.networking import handle_claim_warning
from equations.views.networking import handle_claim_minus_one
from equations.views.networking import handle_a_flub
from equations.views.networking import handle_p_flub
from equations.views.networking import handle_force_out
