<?php

namespace API\ChatProgressCommon\Repositories;

use API\ChatProgressCommon\Interfaces\DealChatRepositoryInterface;
use App\Models\ChatThread;

class DealChatRepository implements DealChatRepositoryInterface
{

    // GET SINGLE DEAL CHAT INFO
    public function getSingleDealChatInfo(?array $whereClouse, ?array $with = [])
    {
        return ChatThread::with($with)->where($whereClouse)->first() ?? null;
    }

    // CREATE NEW DEAL CHAT
    public function createNewDealChatInfo(?array $newData)
    {
        return ChatThread::create($newData);
    }

    // UPDATE  DEAL CHAT
    public function updateDealChatInfo(?array $newData, ?int $threadId)
    {
        return ChatThread::where('id', $threadId)->update($newData);
    }
}
