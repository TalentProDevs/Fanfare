<?php

namespace API\ChatProgressCommon\Transformers\DealChat;

use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;
use App\GlobalSystem\Traits\Property\CommonInfo;

class DealChatResource extends JsonResource
{
    use CommonInfo;

    public function toArray($request)
    {
        return [
            "id" =>  (string) $this->id,
            "sender_id" =>  (string) $this->sender_id,
            "receiver_id" =>  (string) $this->receiver_id,
            "property_id" =>  (string) $this->property_id,
            "case_id" =>  (string) $this->case_id,
            "cso_id" =>  (string) $this->cso_id,
            "created_at" =>  $this->created_at ? Carbon::parse($this->created_at)->format('Y-m-d H:i:s') : '',
            "document_no" =>  (string)$this->document_no,
            "status" =>  (string)$this->status,
            "is_conversation" =>  $this->is_conversation,
            "current_step" =>  $this->current_step,
            "request_from" =>  $this->request_from,
            "is_new" =>  $this->is_new,
            "is_zero_deposit" =>  $this->is_zero_deposit,
            "sender_info" => [
                'sender_email' => $this->tenant?->email ?? '',
                'sender_name' => $this->tenant?->name ?? '',
                'sender_image' => $this->tenant?->profile?->profile_pic ?? '',
            ],
            "receiver_info" => [
                'receiver_email' => $this->landlord?->email ?? '',
                'receiver_name' => $this->landlord?->name ?? '',
                'receiver_image' => $this->landlord?->profile?->profile_pic ?? '',
            ],
            "property_info" => [
                'property_id' => (string) $this->product?->id ?? '',
                'property_name' => $this->product?->property_name ?? '',
                'property_image' => $this->getPropertyThumbnailCoverImage($this->product) ?? '',
            ]
        ];
    }
}
