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
from equations.views.game_flow import handle_new_shake
from equations.views.game_flow import handle_cube_click
from equations.views.game_flow import handle_sector_click
from equations.views.game_flow import handle_set_goal
from equations.views.game_flow import handle_bonus_click
from equations.views.game_flow import handle_call_judge

from equations.views.challenge import handle_a_flub
from equations.views.challenge import handle_p_flub
from equations.views.challenge import handle_no_goal
from equations.views.challenge import handle_siding
from equations.views.challenge import handle_solution_submit
from equations.views.challenge import handle_solution_decision
from equations.views.challenge import handle_rejection_assent

from equations.views.goalsetting import update_cube_xpos
from equations.views.goalsetting import update_cube_orientation

from equations.views.timing import handle_flip_timer
from equations.views.timing import handle_claim_warning
from equations.views.timing import handle_claim_minus_one
