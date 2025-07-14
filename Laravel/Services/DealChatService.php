<?php

namespace API\ChatProgressCommon\Services;

use Illuminate\Support\Facades\Log;
use API\ChatProgressCommon\Interfaces\DealChatRepositoryInterface;
use API\ChatProgressCommon\Transformers\DealChat\DealChatResource;
use API\Property\Interfaces\PropertyApiRepositoryInterface;
use Symfony\Component\HttpFoundation\Response;
use App\Interfaces\Cso\CsoReassignInterface;
use API\ChatProgressCommon\Interfaces\DepositPolicyRepositoryInterface;
use App\GlobalSystem\Traits\Firebase\DealChatFirebaseAction;
use App\Constants\ResponseMessageConstants;

class DealChatService
{
    use DealChatFirebaseAction;
    protected $dealChatRepository;
    protected $propertyRepository;
    protected $csoReassignRepository;
    protected $depositPolicyRepository;
    public function __construct(DealChatRepositoryInterface $dealChatRepository, PropertyApiRepositoryInterface $propertyRepository, CsoReassignInterface $csoReassignRepository, DepositPolicyRepositoryInterface $depositPolicyRepository)
    {
        $this->dealChatRepository = $dealChatRepository;
        $this->propertyRepository = $propertyRepository;
        $this->csoReassignRepository = $csoReassignRepository;
        $this->depositPolicyRepository = $depositPolicyRepository;
    }

    public function createDealChat($request)
    {
        // CHECK IF SENDER ALREADY EXIST
        $sender = $this->getThreadForSender($request);
        if ($sender) {
            $sender->is_new = false;
            $sender->is_zero_deposit = $this->getDepositPlan($sender);
            $resourceInfo = new DealChatResource($sender);
            $response = [
                'chat_info' => $resourceInfo
            ];
        } else {
            $receiver = $this->getThreadForReceiver($request);
            if ($receiver) {
                $receiver->is_new = false;
                $receiver->is_zero_deposit = $this->getDepositPlan($receiver);
                $resourceInfo = new DealChatResource($receiver);
                $response = [
                    'chat_info' => $resourceInfo
                ];
            }
        }

        if (isset($response) && !empty($response)) {
            return successResponse(Response::HTTP_OK, ResponseMessageConstants::DATA_FOUND, $response);
        }


        // CHECK IF RECEIVER ALREADY EXIST
        $response = [
            'chat_info' => []
        ];

        // CHECK THIS PROPERTY IS AVAILABLE
        $isPropertyAvailbale = $this->propertyRepository->isPropertyAvailbale($request->property_id);
        if (!$isPropertyAvailbale) {
            return successResponse(Response::HTTP_NOT_FOUND, 'Property is not available!', $response);
        }

        // CREATE NEW DEAL CHAT
        $newData = [
            'sender_id' => $request->sender_id,
            'receiver_id' => $request->receiver_id,
            'property_id' => $request->property_id
        ];
        // CREATE NEW DEAL CHAT
        $newDealChatInfo = $this->dealChatRepository->createNewDealChatInfo($newData);
        if ($newDealChatInfo) {
            // CSO UPDATE OR ASSIGN
            $this->assignAndUpdateCso($newDealChatInfo?->id, $newDealChatInfo?->property_id, $isPropertyAvailbale?->rzy_admin_id);
            // UPDATE DEPOSIT POLICY
            $this->updateChatThreadDepositPolicy($newDealChatInfo?->id, $newDealChatInfo?->property_id, $request->deposit_policy_id);

            // RESPONSE
            $newDealChatInfo->is_new = true;
            $newDealChatInfo->is_zero_deposit =  $this->getDepositPlan($newDealChatInfo);
            $resourceInfo = new DealChatResource($newDealChatInfo);
            $response = [
                'chat_info' => $resourceInfo
            ];
            $status = ResponseMessageConstants::DATA_FOUND;
        } else {
            $status = ResponseMessageConstants::DATA_NOT_SAVED;
        }
        return successResponse(Response::HTTP_OK, $status, $response);
    }

    // GET SINGLE DEAL CHAT SENDER INFO
    public function getThreadForSender(?object $request)
    {
        $whereSenderClouse = [
            'sender_id' => $request->sender_id,
            'receiver_id' => $request->receiver_id,
            'property_id' => $request->property_id
        ];
        return  $this->getThread($whereSenderClouse);
    }

    // GET SINGLE DEAL CHAT RECEIVER INFO
    public function getThreadForReceiver(?object $request)
    {
        $whereReceiverClouse = [
            'sender_id' => $request->receiver_id,
            'receiver_id' => $request->sender_id,
            'property_id' => $request->property_id
        ];
        return $this->getThread($whereReceiverClouse);
    }

    public function getThread(?array $whereClouse)
    {
        // GET SINGLE DEAL CHAT INFO
        return $this->dealChatRepository->getSingleDealChatInfo($whereClouse);
    }

    // CSO UPDATE OR ASSIGN
    public function assignAndUpdateCso(?int $threadId, ?int $propertyId, ?int $csoId)
    {
        // GET LAST ASSIGNED CSO FOR A GIVEN PROPERTY DEAL CHAT
        $propertyChatCsoInfo = $this->csoReassignRepository->getSingleInfoOfLastAssignedCsoForDealChat($propertyId);
        if ($propertyChatCsoInfo) {
            return $this->updateChatThraed($threadId, $propertyChatCsoInfo->cso_id);
        } else {
            $data = [
                'property_id' => $propertyId,
                'cso_id' => $csoId
            ];
            // CREATE LAST ASSIGNED CSO FOR A GIVEN PROPERTY DEAL CHAT
            $propertyChatCsoInfo = $this->csoReassignRepository->createLastAssignedCsoForPropertyDealChat($data);
            if (!$propertyChatCsoInfo) {
                return false;
            }
            return $this->updateChatThraed($threadId, $propertyChatCsoInfo->cso_id);
        }
    }

    public function updateChatThraed(?int $threadId, ?int $csoId)
    {
        $data = [
            'cso_id' => $csoId
        ];
        // UPDATE DEAL CHAT BY CSO ID
        return $this->dealChatRepository->updateDealChatInfo($data, $threadId);
    }

    public function updateChatThreadDepositPolicy(?int $threadId, ?int $propertyId, ?int $depositPolicyId)
    {

        if ($depositPolicyId) {
            return $this->handleDepositPolicyIdProvided($threadId, $propertyId, $depositPolicyId);
        } else {
            return $this->handleDepositPolicyIdNotProvided($threadId, $propertyId);
        }
    }

    private function handleDepositPolicyIdProvided(?int $threadId, ?int $propertyId, ?int $depositPolicyId): bool
    {
        $insurancePolicyInfo = $this->depositPolicyRepository->firstInsurancePolicyInfo($depositPolicyId);
        $propertyDepositPolicyInfo = $this->depositPolicyRepository->firstPropertyDepositPolicy($propertyId);

        if (!$insurancePolicyInfo || !$propertyDepositPolicyInfo) {
            return false;
        }

        $data = $this->prepareThreadDepositPolicyData($threadId, $insurancePolicyInfo, $propertyDepositPolicyInfo);
        $threadDepositPolicyInfo = $this->depositPolicyRepository->createThreadDepositPolicy($data);

        if (!$threadDepositPolicyInfo) {
            return false;
        }

        if ($insurancePolicyInfo->value == 'no') {
            $this->createThreadDepositInfo($threadId);
        }

        return true;
    }

    private function handleDepositPolicyIdNotProvided(?int $threadId, ?int $propertyId): bool
    {
        $status = false;
        $propertyDepositPolicyInfo = $this->depositPolicyRepository->firstPropertyDepositPolicy($propertyId);

        if (!$propertyDepositPolicyInfo || $propertyDepositPolicyInfo->value == 'both') {
            return false;
        }

        $checkThreadDepositPolicyInfo = $this->depositPolicyRepository->firstThreadDepositPolicy($threadId);
        if ($checkThreadDepositPolicyInfo) {
            return false;
        }

        $data = $this->prepareThreadDepositPolicyData($threadId, null, $propertyDepositPolicyInfo);
        $threadDepositPolicyInfo = $this->depositPolicyRepository->createThreadDepositPolicy($data);

        if (!$threadDepositPolicyInfo) {
            $status = false;
        } else {
            if ($propertyDepositPolicyInfo->value == 'no') {
                $this->createThreadDepositInfo($threadId);
            }
            $status = true;
        }
        return $status;
    }

    private function prepareThreadDepositPolicyData(?int $threadId, $insurancePolicyInfo, $propertyDepositPolicyInfo): array
    {
        return [
            'thread_id' => $threadId,
            'title' => $insurancePolicyInfo ? $insurancePolicyInfo->title : $propertyDepositPolicyInfo->title,
            'value' => $insurancePolicyInfo ? $insurancePolicyInfo->value : $propertyDepositPolicyInfo->value,
            'is_manage_service' => $propertyDepositPolicyInfo->is_manage_service,
            'is_rental_collection' => $propertyDepositPolicyInfo->is_rental_collection,
            'is_landlord_visible' => $propertyDepositPolicyInfo->is_landlord_visible,
            'show_chat_progress_step' => $propertyDepositPolicyInfo->show_chat_progress_step
        ];
    }

    // CREATE TENANT DEPOSIT TRANSACTION INFO
    public function createThreadDepositInfo(?int $threadId)
    {
        // GET SINGLE DEAL CHAT THREAD INFO
        $threadInfo = $this->dealChatRepository->getSingleDealChatInfo(['id' => $threadId]);
        if ($threadInfo && ($threadInfo->landlord?->is_corporate == 'yes')) {
            $depositConfigInfo = $this->depositPolicyRepository->firstTenantDepositConfig(['status' => 1, 'is_corporate' => 'yes']);
        } else {
            $depositConfigInfo = $this->depositPolicyRepository->firstTenantDepositConfig(['status' => 1, 'is_corporate' => 'no']);
        }

        $data = [
            'thread_id' =>  $threadId,
            'title' =>  $depositConfigInfo?->title,
            'deposit_fee_based_on' =>  $depositConfigInfo?->deposit_fee_based_on,
            'rate_type' =>  $depositConfigInfo?->rate_type,
            'rate' =>  $depositConfigInfo?->rate,
            'status' =>  $depositConfigInfo?->status
        ];

        $this->depositPolicyRepository->createThreadDepositConfig($data);
        return true;
    }

    // GET DEPOSIT PLAN
    public function getDepositPlan(?object $threadInfo)
    {
        $threadDepositInfo = $this->depositPolicyRepository->firstThreadDepositPolicy($threadInfo?->id);
        return !($threadDepositInfo && $threadDepositInfo->value == 'no');
    }
}
