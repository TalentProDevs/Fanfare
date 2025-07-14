<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use API\ChatProgressCommon\Http\Controllers\DealChat\DealChatController;


Route::prefix('v2/deal-chat')->group(function () {
    Route::post('getThread', [DealChatController::class, 'getThread']);
});
