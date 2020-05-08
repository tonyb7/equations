from equations.views.index import show_favicon
from equations.views.index import show_index
from equations.views.index import show_game

from equations.views.accounts import show_login
from equations.views.accounts import show_logout
from equations.views.accounts import show_create

from equations.views.connections import on_connect
from equations.views.connections import register_player
from equations.views.connections import on_disconnect

from equations.views.messaging import receive_message

from equations.views.game_flow import handle_start_game
from equations.views.game_flow import handle_cube_click
from equations.views.game_flow import handle_sector_click
from equations.views.game_flow import handle_set_goal
from equations.views.game_flow import handle_bonus_click

from equations.views.challenge import handle_a_flub
from equations.views.challenge import handle_p_flub
from equations.views.challenge import handle_force_out

from equations.views.timing import handle_flip_timer
from equations.views.timing import handle_claim_warning
from equations.views.timing import handle_claim_minus_one
