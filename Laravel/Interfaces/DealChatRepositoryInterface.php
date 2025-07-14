<?php

namespace API\ChatProgressCommon\Interfaces;

interface DealChatRepositoryInterface
{

    // GET SINGLE DEAL CHAT INFO
    public function getSingleDealChatInfo(?array $whereClouse, ?array $with = []);
    // CREATE NEW DEAL CHAT
    public function createNewDealChatInfo(?array $newData);
    // UPDATE  DEAL CHAT
    public function updateDealChatInfo(?array $newData, ?int $threadId);

    
}
