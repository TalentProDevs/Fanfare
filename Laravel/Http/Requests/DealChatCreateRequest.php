<?php

namespace API\ChatProgressCommon\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DealChatCreateRequest extends FormRequest
{

    public function rules()
    {
        $rules = [
            'sender_id' => 'required|numeric',
            'receiver_id' => 'required|numeric',
            'property_id' => 'required|numeric'
        ];

        return $rules;
    }

    public function messages()
    {
        return [
            'sender_id.required' => 'Sender ID is required',
            'receiver_id.required' => 'Receiver ID is required',
            'property_id.required' => 'Property ID is required'
        ];
    }


    public function authorize()
    {
        return true;
    }
}
