//
//  CUTETicketTest.m
//  currant
//
//  Created by Foster Yin on 6/19/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import "CUTETicket.h"
#import "NSArray+ObjectiveSugar.h"


SpecBegin(Ticket)

describe(@"keypath", ^ {

    //because change listener use this mapping
    it(@"all keys in json mapping", ^ {
        NSSet *keys = [CUTETicket propertyKeys];
        NSDictionary *jsonMapping = [CUTETicket JSONKeyPathsByPropertyKey];
        assertThat(@([jsonMapping.allKeys symmetricDifference:keys.allObjects].count), equalToInt(0));
    });
});

describe(@"display title", ^ {

    it(@"should be nil", ^ {
        CUTETicket *ticket = [CUTETicket new];
        assertThat(ticket.titleForDisplay, equalTo(nil));
    });

    it(@"should be custom value", ^ {
        CUTETicket *ticket = [CUTETicket new];
        ticket.title = @"good";
        assertThat(ticket.titleForDisplay, equalTo(@"good"));
    });

    it(@"should be community or street", ^ {
        CUTETicket *ticket = [CUTETicket new];
        ticket.property = [CUTEProperty new];
        ticket.property.community = @"华中科技大学";
        assertThat(ticket.titleForDisplay, equalTo(@"华中科技大学"));
        ticket.property.community = nil;
        ticket.property.street = @"珞瑜路";
        assertThat(ticket.titleForDisplay, equalTo(@"珞瑜路"));
    });

    it(@"should have bedroom count", ^ {

        CUTETicket *ticket = [CUTETicket new];
        ticket.property = [CUTEProperty new];
        ticket.property.community = @"华中科技大学";
        ticket.property.bedroomCount = @(1);
        assertThat(ticket.titleForDisplay, equalTo(@"华中科技大学 1居室"));
    });

    it(@"should have rent type", ^ {

        CUTETicket *ticket = [CUTETicket new];
        ticket.property = [CUTEProperty new];
        ticket.property.community = @"华中科技大学";
        ticket.property.bedroomCount = @(1);
        CUTEEnum *rentType = [CUTEEnum new];
        rentType.value = @"整租";
        ticket.rentType = rentType;
        assertThat(ticket.titleForDisplay, equalTo(@"华中科技大学 1居室 整租出租"));
    });
});


describe(@"params", ^ {

    it(@"should be empty", ^{
        CUTETicket *ticket = [CUTETicket new];
        NSMutableDictionary *params = [NSMutableDictionary dictionaryWithDictionary:ticket.toParams];
        [params removeObjectForKey:@"unset_fields"];
        assertThat(params, isEmpty());

    });

    it(@"should not have id", ^ {
        CUTETicket *ticket = [CUTETicket new];
        assertThat(ticket.toParams[@"id"], equalTo(nil));
    });

    it(@"should not have property object", ^ {
        CUTETicket *ticket = [CUTETicket new];
        assertThat(ticket.toParams[@"property"], equalTo(nil));
    });

    it(@"rent type should be id", ^ {
        CUTETicket *ticket = [CUTETicket new];
        CUTEEnum *rentType = [CUTEEnum new];
        rentType.identifier = @"fdsjkagaklhgalkhgkhas";
        ticket.rentType = rentType;
        assertThat(ticket.toParams[@"rent_type"], instanceOf([NSString class]));
    });

    it(@"deposit type should be id", ^ {
        CUTETicket *ticket = [CUTETicket new];
        CUTEEnum *depositType = [CUTEEnum new];
        depositType.identifier = @"fdsjkagaklhgalkhgkhas";
        ticket.depositType = depositType;
        assertThat(ticket.toParams[@"deposit_type"], instanceOf([NSString class]));
    });

    it(@"landlord type should be id", ^ {
        CUTETicket *ticket = [CUTETicket new];
        CUTEEnum *landlordType = [CUTEEnum new];
        landlordType.identifier = @"fdsjkagaklhgalkhgkhas";
        ticket.landlordType = landlordType;
        assertThat(ticket.toParams[@"landlord_type"], instanceOf([NSString class]));
    });

    it(@"price should be dictionary", ^ {
        CUTETicket *ticket = [CUTETicket new];
        CUTECurrency *price = [CUTECurrency currencyWithValue:8 unit:@"CNY"];
        ticket.price = price;
        assertThat(ticket.toParams[@"price"], instanceOf([NSDictionary class]));
    });

    it(@"space should be dictionary", ^ {
        CUTETicket *ticket = [CUTETicket new];
        CUTEArea *space = [CUTEArea areaWithValue:1 unit:@"meter ** 2"];
        ticket.space = space;
        assertThat(ticket.toParams[@"space"], instanceOf([NSDictionary class]));
    });

    it(@"minimum rent period should be dictionary", ^ {
        CUTETicket *ticket = [CUTETicket new];
        CUTETimePeriod *period = [CUTETimePeriod timePeriodWithValue:2 unit:@"day"];
        ticket.minimumRentPeriod = period;
        assertThat(ticket.toParams[@"minimum_rent_period"], instanceOf([NSDictionary class]));
    });


});

SpecEnd