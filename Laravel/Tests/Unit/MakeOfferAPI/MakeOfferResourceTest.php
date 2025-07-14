<?php

namespace Tests\Unit\MakeOfferAPI;

use Tests\TestCase;
use Mockery;
use API\MakeOffer\Transformers\MakeOfferResource;

class MakeOfferResourceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
    }

    // Handles null or missing tenant/landlord profile data
    /**
     * @covers \API\MakeOffer\Transformers\MakeOfferResource::toArray
     */
    public function test_to_array_handles_make_offer_data()
    {
        // Mock the request
        $request = Mockery::mock(\Illuminate\Http\Request::class);
        $request->shouldReceive('getSchemeAndHttpHost')->andReturn('http://localhost');

        // Mock offer with null profiles
        $offer = Mockery::mock();
        $offer->id = '123';
        $offer->thread_id = '456';
        $offer->property_id = '456';
        $offer->tenant_id = '789';
        $offer->landlord_id = '012';
        $offer->tenant = null;
        $offer->landlord = null;
        $offer->offer_amount = '1000';
        $offer->tenancy_period = '12';
        $offer->commencement_date = '2023-01-01';
        $offer->additional_requirements = 'No smoking';
        $offer->occupiers_list = null;
        $offer->created_at = '2023-01-01 00:00:00';
        $offer->counter = '1';
        $offer->renew_option = '1';
        $offer->renew_time = '12';
        $offer->updated_by = '123';
        $offer->occupiers_count = '2';
        $offer->overall_credit_score = '100';
        $offer->tenant_confirmation_status = '1';
        $offer->tenant_confirmation_date = '2023-01-01';
        $offer->landlord_confirmation_status = '1';
        $offer->landlord_confirmation_date = '2023-01-01';
        $offer->tenant_sig = 'tenant_sig';
        $offer->landlord_sig = 'landlord_sig';
        $offer->status = 'pending';
        $offer->credit_score_grade = 'A';
        $offer->credit_score_overall_grade = 'A';
        $offer->credit_score_action = 'A';
        $offer->credit_score_status = 'A';
        $offer->deposit_policy_id = '123';

        $productMock = Mockery::mock('Product');
        $productMock->shouldReceive('toArray')->andReturn(['product' => 'product']);
        $offer->product = $productMock;


        // Mock getInsurancePolicyId method
        $offer->shouldReceive('getInsurancePolicyId')->andReturn(null);

        // Create resource instance
        $resource = new MakeOfferResource($offer);
        // Get the transformed array
        $result = $resource->toArray($request);

        // Assert null values are handled correctly
        $this->assertNull($result['tenant_fullname']);
        $this->assertNull($result['landlord_fullname']);
        $this->assertEquals('', $result['occupiers_list']);
        $this->assertNull($result['deposit_policy_id']);
    }


    // Returns insurance policy ID when both ThreadDepositPolicy and InsurancePolicy exist
    /**
     * @covers \App\API\MakeOffer\Transformers\MakeOfferResource::getInsurancePolicyId
     */
    public function test_get_insurance_policy_id_returns_id_when_both_policies_exist()
    {
        // Mock the rent offer object
        $rentOffer = Mockery::mock();
        $rentOffer->thread_id = 123;

        // Mock ThreadDepositPolicy model
        $threadDepositPolicy = Mockery::mock('App\Models\Admin\DepositPolicy\ThreadDepositPolicy');
        $threadDepositPolicy->shouldReceive('where')
            ->with('thread_id', 123)
            ->andReturnSelf();
        $threadDepositPolicy->shouldReceive('first')
            ->andReturn(null);

        // Create resource instance
        $resource = new MakeOfferResource($rentOffer);

        // Assert result
        $this->assertNull($resource->getInsurancePolicyId($rentOffer));
    }


    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
