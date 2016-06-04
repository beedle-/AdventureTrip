class TripsController < ApplicationController
  before_action :set_trip, only: [:show, :edit, :update, :destroy]
  # Allows disconnected users to access the index and show pages only.
  before_filter:authenticate_user!, except: [:index, :show]

  # GET /trips
  # GET /trips.json
  def index
    @trips = Trip.all
  end

  # GET /trips/1
  # GET /trips/1.json
  def show
    @comments = @trip.comments
    @comment = Comment.new
  end

  # GET /trips/new
  def new
    @trip = Trip.new
    @transports = Transport.all
    @users = User.where.not(id: current_user.id)
  end

  # GET /trips/1/edit
  def edit
    @transports = Transport.all
    @users = User.where.not(id: current_user.id)
  end

  # POST /trips
  # POST /trips.json
  def create
    #abort(trip_params.inspect)
    @trip = Trip.new(trip_params)

    respond_to do |format|
      if @trip.save
        # Create current user's admin permission on the new created trip.
        adminPerm = Permission.new(:user_id => current_user.id, :trip_id => @trip.id, :permission_type_id => Permission_type.find_by(permission: "admin").id)
        adminPerm.save

        # Get the permission's type, which represent an usually user.
        permUser = Permission_type.find_by(permission: "user").id
        # Create a "user" permission for each selected users.
        params["users"].each do |user|
          perm = Permission.new(:user_id => user, :trip_id => @trip.id, :permission_type_id => permUser)
          perm.save
        end

        # Create each waypoint of the trip.
        i = 0
        params['waypoints'].each do |waypoint|
            i += 1
            w = Stop.new(:title => @trip.title + " - #{i}", :loc_lat => waypoint[1][0], :loc_lon => waypoint[1][1], :trip_id => @trip.id, :etape_nb => i)
            w.save
        end

        # If the endpoint is also the startpoint, add an extra stop.
        if params['arrivalEqualsStart']
            w = Stop.new(:title => @trip.title + " - #{i + 1}", :loc_lat => params["waypoints"]["0"][0], :loc_lon => params["waypoints"]["0"][1], :trip_id => @trip.id, :etape_nb => (i + 1))
            w.save
        end

        format.html { redirect_to @trip, notice: 'Trip was successfully created.' }
        format.json { render :show, status: :created, location: @trip }
      else
        format.html { render :new }
        format.json { render json: @trip.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /trips/1
  # PATCH/PUT /trips/1.json
  def update
     #abort(params["waypoints"]["0"][1].inspect)

     respond_to do |format|
      if @trip.update(trip_params)
        format.html { redirect_to @trip, notice: 'Trip was successfully updated.' }
        format.json { render :show, status: :ok, location: @trip }
      else
        format.html { render :edit }
        format.json { render json: @trip.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /trips/1
  # DELETE /trips/1.json
  def destroy
    # First delete trip's permissions.
    @trip.permissions.each do |perm|
        perm.destroy
    end

    # Then delete the trip itself.
    @trip.destroy
    respond_to do |format|
      format.html { redirect_to trips_url, notice: 'Trip was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_trip
      @trip = Trip.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def trip_params
      params.require(:trip).permit(:title, :description, :public, :start_date, :end_date, :transport_id)
    end
end
