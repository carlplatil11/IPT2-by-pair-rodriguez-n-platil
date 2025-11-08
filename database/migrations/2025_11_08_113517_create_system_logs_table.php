<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSystemLogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('system_logs', function (Blueprint $table) {
            $table->id();
            $table->string('user')->default('Admin');
            $table->string('action'); // Created, Updated, Deleted, Archived, Restored, Error
            $table->string('type'); // Course, Department, Faculty, Student, Academic Year
            $table->text('details')->nullable();
            $table->enum('status', ['success', 'warning', 'error'])->default('success');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('system_logs');
    }
}
