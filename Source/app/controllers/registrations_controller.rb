class RegistrationsController < Devise::RegistrationsController

  private

  def sign_up_params
    params.require(:user).permit(:first_name, :family_name, :user_name, :phone, :email, :password, :password_confirmation)
  end

  def account_update_params
    params.require(:user).permit(:first_name, :family_name, :user_name, :phone, :email, :password, :password_confirmation, :current_password)
  end
end