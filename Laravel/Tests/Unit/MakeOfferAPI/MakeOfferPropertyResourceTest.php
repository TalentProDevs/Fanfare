<?php

namespace Tests\Unit\MakeOfferAPI;

use Tests\TestCase;
use Mockery;
use API\MakeOffer\Transformers\MakeOfferPropertyResource;

class MakeOfferPropertyResourceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
    }

    // Verify that the MakeOfferPropertyResource correctly transforms property data into an array format.
    /**
     * @covers \API\MakeOffer\Transformers\MakeOfferPropertyResource::toArray
     */
    public function test_property_resource_transforms_data_correctly()
    {
        // Create mock for property type
        $propertyType = Mockery::mock();
        $propertyType->title = 'Condo';
        $propertyType->slug = 'condo';

        // Create mock for rental type
        $rentalType = Mockery::mock();
        $rentalType->title = 'For Rent';
        $rentalType->slug = 'for-rent';

        // Create mock property model
        $property = Mockery::mock();
        $property->id = 1;
        $property->property_name = 'Test Property';
        $property->property_address = '123 Test St';
        $property->bedroom = '2';
        $property->floor_size = 1000;
        $property->propertyType = $propertyType;
        $property->rentalType = $rentalType;

        // Create resource instance
        $resource = new MakeOfferPropertyResource($property);

        // Transform to array
        $result = $resource->toArray(request());

        // Assert transformed data
        $this->assertEquals([
            'id' => '1',
            'property_name' => 'Test Property',
            'property_address' => '123 Test St',
            'rental_type' => 'For Rent',
            'rental_type_slug' => 'for-rent',
            'floor_size' => '1000',
            'number_of_bedroom' => '2',
            'property_type' => 'Condo',
            'property_type_slug' => 'condo'
        ], $result);
    }

    // Verify that the MakeOfferPropertyResource correctly handles a null bedroom attribute.
    /**
     * @covers \API\MakeOffer\Transformers\MakeOfferPropertyResource::toArray
     */
    public function test_property_resource_handles_null_bedroom()
    {
        // Create mock for property type
        $propertyType = Mockery::mock();
        $propertyType->title = null;
        $propertyType->slug = null;

        // Create mock for rental type
        $rentalType = Mockery::mock();
        $rentalType->title = null;
        $rentalType->slug = null;

        // Create mock property model with null bedroom
        $property = Mockery::mock();
        $property->id = 1;
        $property->property_name = 'Test Property';
        $property->property_address = '123 Test St';
        $property->bedroom = null;
        $property->floor_size = null;
        $property->propertyType = $propertyType;
        $property->rentalType = $rentalType;

        // Create resource instance
        $resource = new MakeOfferPropertyResource($property);

        // Transform to array
        $result = $resource->toArray(request());

        // Assert transformed data with empty bedroom
        $this->assertEquals([
            'id' => '1',
            'property_name' => 'Test Property',
            'property_address' => '123 Test St',
            'rental_type' => '',
            'rental_type_slug' => '',
            'floor_size' => '',
            'number_of_bedroom' => '',
            'property_type' => '',
            'property_type_slug' => ''
        ], $result);
    }



    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
