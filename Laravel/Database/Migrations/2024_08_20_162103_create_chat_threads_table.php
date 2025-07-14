<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateChatThreadsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('chat_threads', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sender_id');
            $table->unsignedBigInteger('receiver_id');
            $table->unsignedBigInteger('property_id')->nullable();
            $table->unsignedBigInteger('case_id')->nullable();
            $table->unsignedBigInteger('cso_id')->nullable();
            $table->string('document_no')->nullable();
            $table->tinyInteger('status')->default(0)->comment('0 = Progress , 1 = Complete');
            $table->longText('remarks')->nullable();
            $table->tinyInteger('close_status')->default(0)->comment('0 = pending , 1 = close');
            $table->integer('is_conversation')->default(0);
            $table->enum('current_step', [
                'contact',
                'house_viewing',
                'make_offer',
                'tenancy_agreement',
            ])->nullable();
            $table->enum('request_from', ['regular', 'tenten'])->nullable();
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
        Schema::dropIfExists('chat_threads');
    }
}
