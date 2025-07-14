<?php

namespace Tests\Unit\MakeOfferAPI;

use Tests\TestCase;
use Mockery;

use Carbon\Carbon;
use API\MakeOffer\Transformers\ResourceHelperTraits\LandlordTenantParticularResourceHelperTrait;
use API\MakeOffer\Transformers\PropertyInfoForParticularsResource;
use API\MakeOffer\Transformers\UserInfoForParticularsResource;

class LandlordTenantParticularResourceHelperTraitTest extends TestCase
{
    protected $particularResourceHelperTrait;
    protected function setUp(): void
    {
        parent::setUp();
        // Create an object that uses the PaymentTrait.
        $this->particularResourceHelperTrait = $this->getObjectForTrait(LandlordTenantParticularResourceHelperTrait::class);
    }

    // Returns string when given a non-null value
    /**
     * @covers \API\MakeOffer\Transformers\ResourceHelperTraits\LandlordTenantParticularResourceHelperTrait::getStringValue
     */
    public function test_get_string_value_returns_string_for_non_null_value(): void
    {

        // Set test value
        $testValue = 123;

        // Call the method
        $result = $this->particularResourceHelperTrait->getStringValue($testValue);

        // Assert result is string type and matches expected value
        $this->assertIsString($result);
        $this->assertEquals('123', $result);
    }

    // Handles undefined/missing parameter
    /**
     * @covers \API\MakeOffer\Transformers\ResourceHelperTraits\LandlordTenantParticularResourceHelperTrait::getStringValue
     */
    public function test_get_string_value_handles_undefined_parameter(): void
    {

        // Call method without parameter
        $result = $this->particularResourceHelperTrait->getStringValue(null);

        // Assert empty string is returned
        $this->assertIsString($result);
        $this->assertEquals('', $result);
    }

    // Valid date string returns formatted date in 'd-m-Y' format
    /**
     * @covers API\MakeOffer\Transformers\ResourceHelperTraits\LandlordTenantParticularResourceHelperTrait::formatDate
     */
    public function test_format_date_returns_formatted_date_for_valid_input()
    {
        // Set up Carbon mock expectations
        $date = '2023-01-01';
        // Execute method
        $result = $this->particularResourceHelperTrait->formatDate($date);
        // Assert result
        $this->assertEquals('01-01-2023', $result);
    }

    // Null input returns empty string
    /**
     * @covers API\MakeOffer\Transformers\ResourceHelperTraits\LandlordTenantParticularResourceHelperTrait::formatDate
     */
    public function test_format_date_returns_empty_string_for_null_input()
    {
        // Execute and verify
        $result = $this->particularResourceHelperTrait->formatDate(null);
        $this->assertEquals('', $result);
    }

    // Returns 'Months' suffix for tenancy period greater than 1
    /**
     * @covers \API\MakeOffer\Transformers\ResourceHelperTraits\LandlordTenantParticularResourceHelperTrait::getRentalPeriod
     */
    public function test_get_rental_period_returns_months_suffix_for_multiple_months()
    {
        // Call the method
        $result = $this->particularResourceHelperTrait->getRentalPeriod(3);

        // Assert result has correct suffix
        $this->assertEquals('3 Months', $result);
    }

    // Returns 'Months' suffix for tenancy period greater than 1
    /**
     * @covers \API\MakeOffer\Transformers\ResourceHelperTraits\LandlordTenantParticularResourceHelperTrait::getRentalPeriod
     */
    public function test_get_rental_period_returns_months_suffix_for_single_month()
    {
        $result = $this->particularResourceHelperTrait->getRentalPeriod(1);

        $this->assertEquals('1 Month', $result);
    }

    // Returns array with all fields when valid data object is provided
    /**
     * @covers \API\MakeOffer\Transformers\ResourceHelperTraits\LandlordTenantParticularResourceHelperTrait::commonFields
     */
    public function test_common_fields_returns_valid_array_with_all_fields()
    {
        // Create mock data object
        $mockData = Mockery::mock(\stdClass::class);
        $mockData->id = '123';
        $mockData->tenant_id = '456';
        $mockData->landlord_id = '789';
        $mockData->property_id = '101';
        $mockData->is_tenant_accepted = 'yes';
        $mockData->is_landlord_accepted = 'no';
        $mockData->offer_amount = '1000';
        $mockData->created_at = '2023-01-01';
        $mockData->tenancy_period = 12;

        // Mock product and tenant relationships
        $mockProduct = Mockery::mock();
        $mockTenant = Mockery::mock();
        $mockData->product = $mockProduct;
        $mockData->tenant = $mockTenant;

        // Mock PropertyInfoForParticularsResource
        $mockPropertyResource = Mockery::mock(PropertyInfoForParticularsResource::class);
        $this->mock(PropertyInfoForParticularsResource::class)
            ->shouldReceive('__construct')
            ->with($mockProduct)
            ->andReturn($mockPropertyResource);

        // Mock UserInfoForParticularsResource
        $mockUserResource = Mockery::mock(UserInfoForParticularsResource::class);
        $this->mock(UserInfoForParticularsResource::class)
            ->shouldReceive('__construct')
            ->with($mockTenant)
            ->andReturn($mockUserResource);

        // Call method
        $result = $this->particularResourceHelperTrait->commonFields($mockData);

        // Assert result structure and values
        $this->assertIsArray($result);
        $this->assertEquals('123', $result['id']);
        $this->assertEquals('456', $result['tenant_id']);
        $this->assertEquals('789', $result['landlord_id']);
        $this->assertEquals('101', $result['property_id']);
        $this->assertEquals('Accept', $result['status']);
        $this->assertEquals('1000', $result['offer_amount']);
        $this->assertEquals('01-01-2023', $result['offer_date']);
        $this->assertEquals('12 Months', $result['rental_period']);
        $this->assertInstanceOf(PropertyInfoForParticularsResource::class, $result['property']);
        $this->assertInstanceOf(UserInfoForParticularsResource::class, $result['user']);
    }

    // Handles null/missing values in data object fields
    /**
     * @covers \API\MakeOffer\Transformers\ResourceHelperTraits\LandlordTenantParticularResourceHelperTrait::commonFields
     */
    public function test_common_fields_handles_null_values()
    {
        // Create mock data object with null values
        $mockData = Mockery::mock(\stdClass::class);
        $mockData->id = null;
        $mockData->tenant_id = null;
        $mockData->landlord_id = null;
        $mockData->property_id = null;
        $mockData->is_tenant_accepted = null;
        $mockData->is_landlord_accepted = null;
        $mockData->offer_amount = null;
        $mockData->created_at = null;
        $mockData->tenancy_period = null;

        // Mock empty product and tenant relationships
        $mockProduct = Mockery::mock();
        $mockTenant = Mockery::mock();
        $mockData->product = $mockProduct;
        $mockData->tenant = $mockTenant;

        // Mock PropertyInfoForParticularsResource
        $mockPropertyResource = Mockery::mock(PropertyInfoForParticularsResource::class);
        $this->mock(PropertyInfoForParticularsResource::class)
            ->shouldReceive('__construct')
            ->with($mockProduct)
            ->andReturn($mockPropertyResource);

        // Mock UserInfoForParticularsResource
        $mockUserResource = Mockery::mock(UserInfoForParticularsResource::class);
        $this->mock(UserInfoForParticularsResource::class)
            ->shouldReceive('__construct')
            ->with($mockTenant)
            ->andReturn($mockUserResource);

        // Call method
        $result = $this->particularResourceHelperTrait->commonFields($mockData);

        // Assert result handles null values
        $this->assertIsArray($result);
        $this->assertEquals('', $result['id']);
        $this->assertEquals('', $result['tenant_id']);
        $this->assertEquals('', $result['landlord_id']);
        $this->assertEquals('', $result['property_id']);
        $this->assertEquals('Not Accept', $result['status']);
        $this->assertEquals('', $result['offer_amount']);
        $this->assertEquals('', $result['offer_date']);
        $this->assertEquals('', $result['rental_period']);
        $this->assertInstanceOf(PropertyInfoForParticularsResource::class, $result['property']);
        $this->assertInstanceOf(UserInfoForParticularsResource::class, $result['user']);
    }



    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
