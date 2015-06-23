//
//  CUTEPropertyTest.m
//  currant
//
//  Created by Foster Yin on 6/19/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import "CUTEProperty.h"
#import "NSArray+ObjectiveSugar.h"
#import "NSString+OccurrenceCount.h"

SpecBegin(Property)

describe(@"keypath", ^ {

    //because change listener use this mapping
    it(@"all keys in json mapping", ^ {
        NSSet *keys = [CUTEProperty propertyKeys];
        NSDictionary *jsonMapping = [CUTEProperty JSONKeyPathsByPropertyKey];
        assertThat(@([jsonMapping.allKeys symmetricDifference:keys.allObjects].count), equalToInt(0));
    });
});

describe(@"params", ^{

    it(@"should be empty", ^{
        CUTEProperty *property = [CUTEProperty new];
        NSMutableDictionary *params = [NSMutableDictionary dictionaryWithDictionary:property.toParams];
        [params removeObjectForKey:@"unset_fields"];
        assertThat(params, isEmpty());

    });

    it(@"property type should be id", ^{
        CUTEProperty *property = [CUTEProperty new];
        CUTEEnum *propertyType = [CUTEEnum new];
        propertyType.identifier = RANDOM_UUID;
        property.propertyType = propertyType;
        assertThat(property.toParams[@"property_type"], instanceOf([NSString class]));
    });

    it(@"country should be code", ^{
        CUTEProperty *property = [CUTEProperty new];
        CUTECountry *country = [CUTECountry new];
        country.name = @"中国";
        country.code = @"CN";
        property.country = country;
        assertThat(property.toParams[@"country"], equalTo(country.code));
    });

    it(@"city should be id", ^{
        CUTEProperty *property = [CUTEProperty new];
        CUTECity *city = [CUTECity new];
        city.identifier = RANDOM_UUID;
        property.city = city;
        assertThat(property.toParams[@"city"], instanceOf([NSString class]));
    });

    it(@"indoor facilities should be ids", ^{
        CUTEProperty *property = [CUTEProperty new];
        NSMutableArray *facilities = [NSMutableArray array];
        CUTEEnum *facility1 = [CUTEEnum new];
        facility1.identifier = RANDOM_UUID;
        [facilities addObject:facility1];
        CUTEEnum *facility2 = [CUTEEnum new];
        facility2.identifier = RANDOM_UUID;
        [facilities addObject:facility2];

        property.indoorFacilities = facilities;
        NSString *param = property.toParams[@"indoor_facility"];
        assertThat(param, instanceOf([NSString class]));
        assertThatInt([param occurrenceCountOfCharacter:','], equalToInt(1));
    });

    it(@"community facilities should be ids", ^{
        CUTEProperty *property = [CUTEProperty new];
        NSMutableArray *facilities = [NSMutableArray array];
        CUTEEnum *facility1 = [CUTEEnum new];
        facility1.identifier = RANDOM_UUID;
        [facilities addObject:facility1];
        CUTEEnum *facility2 = [CUTEEnum new];
        facility2.identifier = RANDOM_UUID;
        [facilities addObject:facility2];

        property.communityFacilities = facilities;
        NSString *param = property.toParams[@"community_facility"];
        assertThat(param, instanceOf([NSString class]));
        assertThatInt([param occurrenceCountOfCharacter:','], equalToInt(1));
    });
});

SpecEnd
