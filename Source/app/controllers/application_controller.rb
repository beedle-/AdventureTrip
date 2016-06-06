class ApplicationController < ActionController::Base
  before_filter :fetch_invitations

  protected


  def fetch_invitations
  	if user_signed_in?
    sqlRequest = "
    SELECT *
    FROM permissions
    WHERE user_id = ?
        AND accepted = 0"
    @invitations = Permission.find_by_sql [sqlRequest, current_user.id]
	end
  end
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
end
