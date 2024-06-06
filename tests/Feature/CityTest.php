<?php

namespace Tests\Feature;
// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CityTest extends TestCase
{
    public function test_application_returns_successfull_response(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
    }
    


    public function test_obtain_user_map_position(): void
    {
        $response = $this->get('api/map');

        $this->assertNotEmpty($response->json());
        $this->assertJson($response->getContent());
        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_obtain_user_map_position_and_checks_that_exists_in_database_and_returns_lat_len(): void
    {

        $response = $this->get('api/map');
        $city = $this->postJson('api/city', ['city' => $response->json()]);

        $this->assertNotEmpty($response->json());
        $this->assertJson($response->getContent());
        $this->assertEquals(200, $response->getStatusCode());

        $this->assertNotEmpty($city->json());
        $this->assertJson($city->getContent());
        $this->assertEquals(200, $city->getStatusCode());
        $this->assertArrayHasKey('lat', $city->json());
        $this->assertArrayHasKey('lng', $city->json());
    }

    public function test_invalid_user_map_position_and_does_not_exists_in_database_and_returns_error(): void
    {
        $city = $this->postJson('api/city', ['city' => "albahaca"]);
        $city->assertStatus(404);
    }

    public function test_obtain_city_weather_using_lat_len(): void
    {
        $response = $this->get('api/map');
        $city = $this->postJson('api/city', ['city' => $response->json()]);


        $this->assertNotEmpty($city->json());
        $this->assertJson($city->getContent());
        $this->assertEquals(200, $city->getStatusCode());
        $this->assertArrayHasKey('lat', $city->json());
        $this->assertArrayHasKey('lng', $city->json());

        $weather = $this->postJson('api/weather', ['lat' => $city['lat'], 'lng' => $city['lng']]);

        $this->assertNotEmpty($weather->json());
        $this->assertJson($weather->getContent());

        $this->assertEquals(200, $weather->getStatusCode());
    }

    public function test_invalid_city_name_returns_error(): void
    {
        $city = $this->postJson('api/city', ['city' => null]);
        $city->assertStatus(422);
    }

    public function test_missing_lat_lng_for_weather_returns_error(): void
    {
        $weather = $this->postJson('api/weather', ['lat' => null, 'lng' => null]);
        $weather->assertStatus(422);
    }
    
    public function test_translate_weather_data_to_json(): void
    {
        $response = $this->get('api/map');
        $city = $this->postJson('api/city', ['city' => $response->json()]);

        $this->assertNotEmpty($city->json());
        $this->assertJson($city->getContent());
        $this->assertEquals(200, $city->getStatusCode());
        $this->assertArrayHasKey('lat', $city->json());
        $this->assertArrayHasKey('lng', $city->json());

        $weather = $this->postJson('api/weather', ['lat' => $city['lat'], 'lng' => $city['lng']]);

        $this->assertNotEmpty($weather->json());
        $this->assertJson($weather->getContent());        
        $this->assertEquals(200, $weather->getStatusCode());
    
        $weatherTranslated = $this->postJson('api/weather_translate', $weather->json());

        $this->assertNotEmpty($weatherTranslated->json());
        $this->assertJson($weatherTranslated->getContent());
        $this->assertEquals(200, $weatherTranslated->getStatusCode());
        
    }
}


