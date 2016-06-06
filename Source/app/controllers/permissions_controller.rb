class PermissionsController < ApplicationController
	before_action :set_permission


	def accept
		puts "ok"
		@permission.accepted = 1
		@permission.save
	end

	def refuse
		puts "nok"
		@permission.destroy
	end

	private
	    # Use callbacks to share common setup or constraints between actions.
	    def set_permission
	      @permission = Permission.find(params[:id])
	    end
end
