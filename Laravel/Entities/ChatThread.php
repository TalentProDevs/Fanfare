<?php

namespace API\ChatProgressCommon\Entities;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Admin\Cso\RzyCsoStageCommentInfo;
use App\Models\Admin\RzyChatThreadProgressStep;
use App\Models\Admin\DepositPolicy\ThreadDepositPolicy;
use App\Models\Admin\DepositPolicy\ThreadDepositConfig;
use App\Models\Admin\Property\RzyThreadPropertyServiceInfo;

class ChatThread extends Model
{
    protected $table = 'chat_threads';

    protected $with = ['landlord', 'tenant', 'product'];
    protected $fillable = ['sender_id', 'receiver_id', 'property_id', 'current_step'];

    /**
     * Get the tenant that owns the ChatThread
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'sender_id', 'id');
    }

    /**
     * Get the landlord that owns the ChatThread
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function landlord(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'receiver_id', 'id')->with(['rzyCorporateSystemPolicySetting']);
    }

    /**
     * Get the product that owns the ChatThread
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'property_id', 'id')->with(['rentalType', 'propertyType']);
    }

    public function makeOffer()
    {
        return $this->hasOne(MakeOffer::class, 'property_id', 'property_id')
            ->where('landlord_id', $this->receiver_id)
            ->where('tenant_id', $this->sender_id)
            ->orderBy('id', 'desc');
    }

    public function assignedCso()
    {
        return $this->belongsTo(User::class, 'cso_id', 'id');
    }

    public function csoChatComments()
    {
        return $this->hasMany(RzyCsoStageCommentInfo::class, 'thread_id', 'id')
            ->where('stage_status', 3)
            ->orderBy('id', 'desc');
    }

    public function chatThreadProgressStep()
    {
        return $this->hasOne(RzyChatThreadProgressStep::class, 'chat_thread_id', 'id');
    }

    public function collectionF()
    {
        return $this->hasOne(Collection::class, 'rzy_case_id', 'case_id')->where('purpose', 'rzy_booking_fee')->where('document_short_code', 'F');
    }
    public function collectionS()
    {
        return $this->hasOne(Collection::class, 'rzy_case_id', 'case_id')->where('purpose', 'rzy_first_month_rental_fee')->where('document_short_code', 'S');
    }

    public function case()
    {
        return $this->belongsTo(RzyCase::class, 'case_id', 'id');
    }

    public function threadDepositPolicy()
    {
        return $this->hasOne(ThreadDepositPolicy::class, 'thread_id', 'id');
    }

    public function threadDepositConfig()
    {
        return $this->hasOne(ThreadDepositConfig::class, 'thread_id', 'id');
    }

    public function rentOffer()
    {
        return $this->hasOne(MakeOffer::class, 'thread_id', 'id');
    }

    public function rzyThreadPropertyServiceInfos()
    {
        return $this->hasMany(RzyThreadPropertyServiceInfo::class, 'thread_id', 'id');
    }

    public function agreement()
    {
        return $this->hasOne(Agreement::class, 'thread_id', 'id');
    }


    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $search = make_keyword($search);
            $query->where(function ($query) use ($search) {
                $query->where('id', 'like', '%' . $search . '%')
                    ->orWhereHas('tenant', function (Builder $query) use ($search) {
                        $query->where('name', 'like', '%' . $search . '%')
                            ->orWhereHas('profile', function (Builder $query) use ($search) {
                                $query->where('name', 'like', '%' . $search . '%')
                                    ->orWhere('last_name', 'like', '%' . $search . '%')
                                    ->orWhereRaw('concat(name, last_name) like "%' . $search . '%"');
                            });
                    })
                    ->orWhereHas('landlord', function (Builder $query) use ($search) {
                        $query->where('name', 'like', '%' . $search . '%')
                            ->orWhereHas('profile', function (Builder $query) use ($search) {
                                $query->where('name', 'like', '%' . $search . '%')
                                    ->orWhere('last_name', 'like', '%' . $search . '%')
                                    ->orWhereRaw('concat(name, last_name) like "%' . $search . '%"');
                            });
                    })
                    ->orWhereHas('product', function (Builder $query) use ($search) {
                        $query->where('property_name', 'like', '%' . $search . '%');
                    });
            });
        })->when($filters['close_status'] ?? null, function ($query, $is_close_status) {
            if ($is_close_status == 'pending') {
                $query->where('close_status', 0);
            } else {
                $query->where('close_status', $is_close_status);
            }
        });

        // Call the helper function to handle 'from' and 'to' filters for 'created_at'
        processFormToRangeFilter($query, $filters, 'created_at');
    }

    public function scopeSort($query)
    {
        scopeSortListing($query);
    }
}
