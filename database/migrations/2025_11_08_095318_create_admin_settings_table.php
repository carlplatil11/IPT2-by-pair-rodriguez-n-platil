<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAdminSettingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('admin_settings', function (Blueprint $table) {
            $table->id();
            $table->string('first_name')->default('Admin');
            $table->string('last_name')->default('User');
            $table->string('email')->unique()->default('admin@edumanage.com');
            $table->string('phone')->nullable();
            $table->string('role')->default('System Administrator');
            $table->string('date_of_birth')->nullable();
            $table->string('country')->nullable();
            $table->string('city')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('username')->unique()->default('admin');
            $table->string('password');
            $table->timestamps();
        });

        // Insert default admin
        DB::table('admin_settings')->insert([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@edumanage.com',
            'phone' => '(+63) 123-456-7890',
            'role' => 'System Administrator',
            'date_of_birth' => '01-01-1990',
            'country' => 'Philippines',
            'city' => 'Manila',
            'postal_code' => '1000',
            'username' => 'admin',
            'password' => bcrypt('admin'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('admin_settings');
    }
}
