//
//  CUTERentAddressEditForm.m
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentAddressEditForm.h"
#import "CUTECommonMacro.h"
#import "CUTEEnum.h"
#import <NSArray+ObjectiveSugar.h>
#import "CUTEFormFixNonBreakingSpaceTextFieldCell.h"
#import "CUTEFormDefaultCell.h"
#import "CUTECity.h"
#import "CUTEFormFieldOptionViewController.h"
#import "CUTEFormTextCell.h"
#import "CUTEAPICacheManager.h"
#import "Sequencer.h"


@interface CUTERentAddressEditForm () {

    NSArray *_allCountries;

    NSArray *_allCities;

    NSArray *_allNeighborhoods;
}

@end

@implementation CUTERentAddressEditForm


- (NSArray *)fields {
    NSMutableArray *array = [NSMutableArray
                             arrayWithArray:@[
                                              @{FXFormFieldKey: @"postcode", FXFormFieldTitle: STR(@"RentAddressEdit/Postcode"), FXFormFieldDefaultValue: _postcode? _postcode: @"", FXFormFieldCell: [CUTEFormFixNonBreakingSpaceTextFieldCell class], FXFormFieldAction: @"onPostcodeEdit:"},
                                              @{FXFormFieldKey: @"street", FXFormFieldTitle: STR(@"RentAddressEdit/街道（选填）"), FXFormFieldDefaultValue: _street? _street: @"", FXFormFieldCell: [CUTEFormFixNonBreakingSpaceTextFieldCell class], FXFormFieldAction: @"onStreetEdit:"},
                                              @{FXFormFieldKey: @"community", FXFormFieldTitle: STR(@"RentAddressEdit/小区（选填）"), FXFormFieldDefaultValue: _community? _community: @"", FXFormFieldCell: [CUTEFormFixNonBreakingSpaceTextFieldCell class], FXFormFieldAction: @"onCommunityEdit:"},
                                              @{FXFormFieldKey: @"floor", FXFormFieldTitle: STR(@"RentAddressEdit/楼层（选填）"), FXFormFieldDefaultValue: _floor? _floor: @"", FXFormFieldCell: [CUTEFormFixNonBreakingSpaceTextFieldCell class], FXFormFieldAction: @"onFloorEdit:"},
                                              @{FXFormFieldKey: @"houseName", FXFormFieldTitle: STR(@"RentAddressEdit/房间号（选填）"), FXFormFieldDefaultValue: _houseName? _houseName: @"", FXFormFieldCell: [CUTEFormFixNonBreakingSpaceTextFieldCell class], FXFormFieldAction: @"onHouseNameEdit:"},
                                              ]];
    if (_country) {
        [array insertObject:@{FXFormFieldKey: @"country", FXFormFieldTitle: STR(@"RentAddressEdit/国家"), FXFormFieldOptions: _allCountries, FXFormFieldDefaultValue: _country, FXFormFieldAction: @"onCountryEdit:", FXFormFieldHeader:STR(@"RentAddressEdit/地址")} atIndex:0];
    }
    else {
        [array insertObject:@{FXFormFieldKey: @"country", FXFormFieldTitle: STR(@"RentAddressEdit/国家"), FXFormFieldOptions: _allCountries, FXFormFieldAction: @"onCountryEdit:", FXFormFieldHeader:STR(@"RentAddressEdit/位置"), FXFormFieldHeader:STR(@"RentAddressEdit/地址")} atIndex:0];
    }
    if (_city) {
        [array insertObject:@{FXFormFieldKey: @"city", FXFormFieldTitle: STR(@"RentAddressEdit/城市"), FXFormFieldOptions: _allCities, FXFormFieldDefaultValue: _city, FXFormFieldAction: @"onCityEdit:", FXFormFieldViewController: [CUTEFormFieldOptionViewController class]} atIndex:1];
    }
    else {
        if (!IsArrayNilOrEmpty(_allCities)) {
             [array insertObject:@{FXFormFieldKey: @"city", FXFormFieldTitle: STR(@"RentAddressEdit/城市"), FXFormFieldOptions:_allCities, FXFormFieldAction: @"onCityEdit:",  FXFormFieldViewController: [CUTEFormFieldOptionViewController class]} atIndex:1];
        }
    }

    if (_neighborhood) {
        [array insertObject:@{FXFormFieldKey: @"neighborhood", FXFormFieldTitle: STR(@"RentAddressEdit/街区"), FXFormFieldOptions: _allNeighborhoods, FXFormFieldDefaultValue: _neighborhood, FXFormFieldAction: @"onNeighborhoodEdit:", FXFormFieldViewController: [CUTEFormFieldOptionViewController class]} atIndex:3];
    }
    else {
        if (!IsArrayNilOrEmpty(_allNeighborhoods)) {
            [array insertObject:@{FXFormFieldKey: @"neighborhood", FXFormFieldTitle: STR(@"RentAddressEdit/街区"), FXFormFieldOptions:_allNeighborhoods, FXFormFieldAction: @"onNeighborhoodEdit:",  FXFormFieldViewController: [CUTEFormFieldOptionViewController class]} atIndex:3];
        }
    }

    if (self.singleUseForReedit) {
        [array insertObject:@{FXFormFieldKey: @"location", FXFormFieldTitle:STR(@"RentAddressEdit/房产位置"), FXFormFieldAction: @"onLocationEdit:", FXFormFieldCell: [CUTEFormTextCell class], FXFormFieldHeader:STR(@"RentAddressEdit/地图")} atIndex:0];
    }

    return array;
}

- (void)setAllCountries:(NSArray *)allCountries {
    _allCountries = allCountries;
}

- (void)setAllCities:(NSArray *)allCities {
    _allCities = allCities;
}

- (void)setAllNeighborhoods:(NSArray *)allNeighborhoods {
    _allNeighborhoods = allNeighborhoods;
}

- (BFTask *)updateWithTicket:(CUTETicket *)ticket {
    CUTERentAddressEditForm *form = self;
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];

    Sequencer *sequencer = [Sequencer new];
    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        [[[CUTEAPICacheManager sharedInstance] getCountriesWithCountryCode:NO] continueWithBlock:^id(BFTask *task) {
            if (task.error) {
                [tcs setError:task.error];
            }
            else if (task.exception) {
                [tcs setException:task.exception];
            }
            else if (task.isCancelled) {
                [tcs cancel];
            }
            else {
                completion(task.result);
            }
            return task;
        }];
    }];

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        NSArray *countries = result;
        [form setAllCountries:countries];

        NSInteger countryIndex = [countries indexOfObject:ticket.property.country];
        if (countryIndex != NSNotFound) {
            CUTECountry *country = [countries objectAtIndex:countryIndex];
            [[[CUTEAPICacheManager sharedInstance] getCitiesByCountry:country] continueWithBlock:^id(BFTask *task) {
                NSArray *cities = task.result;
                if (!IsArrayNilOrEmpty(cities)) {
                    NSArray *cities = task.result;
                    if (countryIndex != NSNotFound) {
                        [form setCountry:[countries objectAtIndex:countryIndex]];
                    }
                    [form setAllCities:cities];
                    NSInteger cityIndex = [cities indexOfObject:ticket.property.city];
                    if (cityIndex != NSNotFound) {
                        [form setCity:[cities objectAtIndex:cityIndex]];
                    }
                    completion(cities);

                }
                else {
                    [tcs setError:task.error];
                }
                
                return task;
            }];
        }
        else {
            completion(nil);
        }
    }];

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        if (form.city) {
            [[[CUTEAPICacheManager sharedInstance] getNeighborhoodByCity:form.city] continueWithBlock:^id(BFTask *task) {
                if (task.error) {
                    [tcs setError:task.error];
                }
                else if (task.exception) {
                    [tcs setException:task.exception];
                }
                else if (task.isCancelled) {
                    [tcs cancel];
                }
                else {
                    [form setAllNeighborhoods:task.result];
                    form.neighborhood = ticket.property.neighborhood;
                    completion(task.result);
                }
                return task;
            }];
        }
        else {
            completion(nil);
        }
    }];


    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        form.street = ticket.property.street;
        form.postcode = ticket.property.zipcode;
        form.community = ticket.property.community;
        form.floor = ticket.property.floor;
        form.houseName = ticket.property.houseName;
        [tcs setResult:form];
    }];

    [sequencer run];
    return tcs.task;
}

- (NSError *)validateFormWithScenario:(NSString *)scenario {
    NSError *error = nil;
    [NGRValidator validateModel:self error:&error delegate:nil rules:^NSArray *{
        return @[NGRValidate(@"city").required(),
                 NGRValidate(@"postcode").required(),
                 NGRValidate(@"country").required()
                 ];
    }];
    return error;
}

@end
