<?php

namespace API\ChatProgressCommon\Http\Controllers\DealChat;

use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use API\ChatProgressCommon\Services\DealChatService;
use API\ChatProgressCommon\Http\Requests\DealChatCreateRequest;

class DealChatController extends Controller
{
    protected $dealChatService;
    public function __construct(DealChatService $dealChatService)
    {
        $this->dealChatService = $dealChatService;
    }

    public function getThread(DealChatCreateRequest $request)
    {
        return $this->dealChatService->createDealChat($request);
    }
}
