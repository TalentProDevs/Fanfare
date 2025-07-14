<?php

namespace Tests\Unit\MakeOfferAPI;

use Tests\TestCase;
use Mockery;
use API\MakeOffer\Transformers\OccupireListResource;

class OccupireListResourceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
    }

    // Returns array with tenant_id mapped from user_id
    /**
     * @covers API\MakeOffer\Transformers\OccupireListResource::toArray
     */
    public function test_to_array_maps_user_id_to_tenant_id()
    {
        // Mock the resource class
        $resource = \Mockery::mock(OccupireListResource::class)->makePartial();

        // Set the user_id property
        $resource->user_id = 123;

        // Create mock request
        $request = \Mockery::mock(\Illuminate\Http\Request::class);

        // Call the toArray method
        $result = $resource->toArray($request);

        // Assert tenant_id is mapped from user_id
        $this->assertEquals(123, $result['tenant_id']);

        // Assert occupiers_list exists
        $this->assertArrayHasKey('occupiers_list', $result);
    }

    // Handles null user_id value
    /**
     * @covers API\MakeOffer\Transformers\OccupireListResource::toArray
     */
    public function test_to_array_handles_null_user_id()
    {
        // Mock the resource class
        $resource = \Mockery::mock(OccupireListResource::class)->makePartial();

        // Set null user_id
        $resource->user_id = null;

        // Create mock request
        $request = \Mockery::mock(\Illuminate\Http\Request::class);

        // Call the toArray method
        $result = $resource->toArray($request);

        // Assert tenant_id is null
        $this->assertNull($result['tenant_id']);

        // Assert occupiers_list exists
        $this->assertArrayHasKey('occupiers_list', $result);
    }





    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
