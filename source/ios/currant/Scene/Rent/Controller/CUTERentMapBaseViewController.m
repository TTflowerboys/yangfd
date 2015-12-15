//
//  CUTERentMapBaseViewController.m
//  currant
//
//  Created by Foster Yin on 12/15/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

#import "CUTERentMapBaseViewController.h"
#import <MKMapView+BBT.h>
#import <BFCancellationTokenSource.h>
#import "CUTEMapTextField.h"
#import "CUTETooltipView.h"
#import "CUTECommonMacro.h"
#import "MasonryMake.h"
#import <UIAlertView+Blocks/UIAlertView+Blocks.h>
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTEAddressUtil.h"
#import "currant-Swift.h"

@interface CUTERentMapBaseViewController () <MKMapViewDelegate, UITextFieldDelegate> {

    MKMapView *_mapView;

    CUTEMapTextField *_textField;

    UIButton *_userLocationButton;

    UIImageView *_annotationView;

    BFCancellationTokenSource *_cancellationTokenSource;

    BFTask *_updateAddressTask;
}



@end

@implementation CUTERentMapBaseViewController
@synthesize mapView = _mapView, textField = _textField, annotationView = _annotationView, userLocationButton = _userLocationButton, cancellationTokenSource = _cancellationTokenSource;

#pragma - mark Life cycle

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"RentAddressMap/房产位置");

    _mapView = [[MKMapView alloc] init];
    _mapView.frame = CGRectMake(0, StatusBarHeight + TouchHeightDefault, RectWidth(self.view.bounds), RectHeightExclude(self.view.bounds, (StatusBarHeight + TouchHeightDefault)));
    //    _mapView.frame = self.view.bounds;
    _mapView.delegate = self;
    [self.view addSubview:_mapView];


    UIImageView *annotationView =  [[UIImageView alloc] init];
    annotationView.image = IMAGE(@"icon-location-building");
    [self.view addSubview:annotationView];

    CGSize imageSize = annotationView.image.size;
    MakeBegin(annotationView)
    MakeCenterXEqualTo(_mapView);
    MakeCenterYEqualTo(_mapView).offset(- imageSize.height / 2);
    MakeEnd
    _annotationView = annotationView;

    _textField = [[CUTEMapTextField alloc] initWithFrame:CGRectMake(16, 30 + TouchHeightDefault + StatusBarHeight, ScreenWidth - 32, 60)];
    _textField.rightView = [[UIImageView alloc] initWithImage:IMAGE(@"map-address-location")];
    _textField.rightViewMode = UITextFieldViewModeAlways;
    _textField.background = [[UIImage imageNamed:@"map-textfield-background"] resizableImageWithCapInsets:UIEdgeInsetsMake(10, 10, 10, 10)];
    _textField.delegate = self;
    [self.view addSubview:_textField];
    _textField.rightView.userInteractionEnabled = YES;
    _textField.accessibilityIdentifier = @"MapTextField";
    _textField.accessibilityLabel = @"MapTextField";
    _userLocationButton = [UIButton buttonWithType:UIButtonTypeCustom];
    [_userLocationButton setImage:IMAGE(@"map-user-location") forState:UIControlStateNormal];
    _userLocationButton.frame = CGRectMake(ScreenWidth - 40 -15, ScreenHeight - TabBarHeight - 40 - 15, 40, 40);
    [self.view addSubview:_userLocationButton];
}

#pragma - mark Util

- (void)startUpdateAllWithCurrentLocation {
    CLAuthorizationStatus status = [CLLocationManager authorizationStatus];
    if (status == kCLAuthorizationStatusDenied || status == kCLAuthorizationStatusRestricted) {
        [UIAlertView showWithTitle:STR(@"RentAddressMap/此应用程序对您的位置没有访问权，您可以在隐私设置中启用访问权或自行填写地址") message:nil cancelButtonTitle:STR(@"RentAddressMap/OK") otherButtonTitles:nil tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
        }];
    }
    else {
        [SVProgressHUD show];
        _cancellationTokenSource = [BFCancellationTokenSource cancellationTokenSource];

        [[[CUTEGeoManager sharedInstance] requestCurrentLocation:_cancellationTokenSource.token] continueWithBlock:^id(BFTask *task) {
            _cancellationTokenSource = nil;
            if (task.isCancelled) {
                [SVProgressHUD dismiss];
                [UIAlertView showWithTitle:STR(@"RentAddressMap/此应用程序对您的位置没有访问权，您可以在隐私设置中启用访问权或自行填写地址") message:nil cancelButtonTitle:STR(@"RentAddressMap/OK") otherButtonTitles:nil tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
                }];
            }
            else if (task.result) {
                CLLocation *location = task.result;
                CLLocation *centerLocation = [[CLLocation alloc] initWithLatitude:self.mapView.centerCoordinate.latitude longitude:self.mapView.centerCoordinate.longitude];
                if ([location distanceFromLocation:centerLocation] > 10) {
                    MKCoordinateRegion region = MKCoordinateRegionMakeWithDistance(location.coordinate, kRegionDistance, kRegionDistance);
                    [self.mapView setRegion:[self.mapView regionThatFits:region] animated:YES];
                }
                CUTERentAddressMapForm *form = self.form;

                [form syncTicketWithBlock:^(CUTETicket *ticket) {
                    ticket.property.latitude = @(location.coordinate.latitude);
                    ticket.property.longitude = @(location.coordinate.longitude);
                }];

                _cancellationTokenSource = [BFCancellationTokenSource cancellationTokenSource];
                [[self checkNeedUpdateAddressWithCancellationToken:_cancellationTokenSource.token] continueWithBlock:^id(BFTask *task) {
                    _cancellationTokenSource = nil;
                    [SVProgressHUD dismiss];
                    return task;
                }];
            }
            else {
                [SVProgressHUD showErrorWithError:task.error];
            }
            return nil;
        }];
    }
}

- (BFTask *)checkNeedUpdateAddressWithCancellationToken:(BFCancellationToken * _Nullable)cancellationToken {
    if (!_updateAddressTask || _updateAddressTask.isCompleted) {
        _updateAddressTask = [self updateAddressWithCancellationToken:cancellationToken];
    }

    return _updateAddressTask;
}

- (BFTask *)updateAddressWithCancellationToken:(BFCancellationToken * __nullable)cancellationToken {
    CUTEProperty *property = self.form.ticket.property;
    BFTaskCompletionSource *tcs  = [BFTaskCompletionSource taskCompletionSource];
    CLLocation *location = [[CLLocation alloc] initWithLatitude:property.latitude.doubleValue longitude:property.longitude.doubleValue];
    if (location) {
        [[[CUTEGeoManager sharedInstance] reverseGeocodeLocation:location cancellationToken:cancellationToken] continueWithBlock:^id(BFTask *task) {
            if (task.isCancelled) {
                if (!tcs.task.isCompleted) {
                    [tcs cancel];
                }
            }
            else if (task.result) {
                CUTEPlacemark *placemark = task.result;
                [self.form syncTicketWithBlock:^(CUTETicket *ticket) {
                    if (placemark.country) {
                        ticket.property.country = placemark.country;
                    }

                    if (placemark.city) {
                        ticket.property.city = placemark.city;
                    }

                    ticket.property.zipcode = placemark.postalCode;
                    ticket.property.neighborhood = nil;
                    ticket.property.street = [CUTEAddressUtil buildAddress:@[NilNullToEmpty(placemark.street), NilNullToEmpty(placemark.neighborhood)]];
                    ticket.property.community = nil;
                    ticket.property.floor = nil;
                    ticket.property.houseName = nil;
                }];

                if (!IsNilNullOrEmpty(self.form.ticket.property.zipcode)) {
                    [[self updateNeighborhoodWithPostcodeChange:self.form.ticket.property.zipcode countryCode:self.form.ticket.property.country.ISOcountryCode cancellationToken:cancellationToken] continueWithBlock:^id(BFTask *task) {
                        if (task.isCancelled) {
                            if (!tcs.task.isCompleted) {
                                [tcs cancel];
                            }
                        }
                        else if (task.result) {
                            [self.form syncTicketWithBlock:^(CUTETicket *ticket) {
                                ticket.property.neighborhood = task.result;
                            }];

                            self.textField.text = property.address;
                            [self.textField setNeedsDisplay];
                            [tcs setResult:self.textField.text];
                        }
                        else {
                            self.textField.text = property.address;
                            [self.textField setNeedsDisplay];
                            [tcs setResult:self.textField.text];
                        }

                        return task;
                    }];
                }
                else {

                    self.textField.text = property.address;
                    [self.textField setNeedsDisplay];
                    [tcs setResult:self.textField.text];
                }
            }
            else {
                TrackEvent(GetScreenName(self), kEventActionRequestReturn, @"non-geocoding-result", nil);
                [tcs setError:task.error];
            }
            return task;
        }];
    }
    else {
        [tcs setError:nil];
    }
    return tcs.task;
}


- (BFTask *)updateNeighborhoodWithPostcodeChange:(NSString *)newPostcode countryCode:(NSString *)countryCode cancellationToken:(BFCancellationToken * __nullable)cancellationToken {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    NSString *postCodeIndex = [[newPostcode stringByReplacingOccurrencesOfString:@" " withString:@""] uppercaseString];

    [[[CUTEGeoManager sharedInstance] searchPostcodeIndex:postCodeIndex countryCode:countryCode cancellationToken:cancellationToken] continueWithBlock:^id(BFTask *task) {

        NSArray *places = (NSArray *)task.result;
        if (task.isCancelled) {
            if (!tcs.task.isCompleted) {
                [tcs cancel];
            }
        }
        else if (!IsArrayNilOrEmpty(places)) {
            CUTEPostcodePlace *place = places.firstObject;
            if (place && [place isKindOfClass:[CUTEPostcodePlace class]]) {
                CUTENeighborhood *neighborhood = IsArrayNilOrEmpty(place.neighborhoods)? nil: [place.neighborhoods firstObject];
                [tcs setResult:neighborhood];
            }
            else {
                [tcs setError:[NSError errorWithDomain:CUTE_ERROR_DOMAIN code:-1 userInfo:@{NSLocalizedDescriptionKey: STR(@"API/返回格式不正确")}]];
            }
        }
        else {
            [tcs setError:task.error];
        }
        return task;
    }];


    return tcs.task;
}

- (void)startUpdateLocationWithAddress {
    TrackEvent(GetScreenName(self), kEventActionPress, @"look-up-address", nil);

    if (IsNilNullOrEmpty(self.textField.text)) {
        [SVProgressHUD showErrorWithStatus:STR(@"RentAddressMap/地址不能为空，请编辑地址")];
        return;
    }

    [self.textField.indicatorView startAnimating];

    NSString *street = [CUTEAddressUtil buildAddress:@[NilNullToEmpty(self.form.ticket.property.community), NilNullToEmpty(self.form.ticket.property.street)]];
    NSMutableDictionary *componmentsDictionary = [NSMutableDictionary dictionary];
    if (self.form.ticket.property.country.ISOcountryCode) {
        [componmentsDictionary setObject:self.form.ticket.property.country.ISOcountryCode forKey:@"country"];
    }
    if (self.form.ticket.property.city.name) {
        [componmentsDictionary setObject:self.form.ticket.property.city.name forKey:@"locality"];
    }
    if (self.form.ticket.property.zipcode) {
        [componmentsDictionary setObject:self.form.ticket.property.zipcode forKey:@"postal_code"];
    }
    NSString *components = [CUTEGeoManager buildComponentsWithDictionary:componmentsDictionary];
    _cancellationTokenSource = [BFCancellationTokenSource cancellationTokenSource];
    [[[CUTEGeoManager sharedInstance] geocodeWithAddress:street components:components cancellationToken:_cancellationTokenSource.token] continueWithBlock:^id(BFTask *task) {
        [self.textField.indicatorView stopAnimating];
        _cancellationTokenSource = nil;

        if (task.isCancelled) {
            [SVProgressHUD showErrorWithCancellation];
        }
        else if (task.error) {
            [SVProgressHUD showErrorWithError:task.error];
        }
        else if (task.exception) {
            [SVProgressHUD showErrorWithException:task.exception];
        }
        else {
            if (task.result) {
                CUTEPlacemark *placemark = task.result;
                MKCoordinateRegion region = MKCoordinateRegionMakeWithDistance(placemark.location.coordinate, kRegionDistance, kRegionDistance);
                [self.mapView setRegion:[self.mapView regionThatFits:region] animated:YES];
            }
            else {
                [SVProgressHUD showErrorWithStatus:STR(@"RentAddressMap/重新定位失败")];
            }
        }

        return task;
    }];
}

- (void)startUpdateAddressWithLocation:(CLLocation *)location {

    CLLocation *oldLocation = nil;
    if (self.form.ticket.property.latitude && self.form.ticket.property.longitude) {
        oldLocation = [[CLLocation alloc] initWithLatitude:self.form.ticket.property.latitude.doubleValue longitude:self.form.ticket.property.longitude.doubleValue];
    }

    //这里检查location是否被改动过，改了，则去更新相关属性，因为是浮点数，用 2m 作为一个 threshold 来比较
    //update field value
    CLLocationDistance distanceThreshold = 2.0; // in meters
    if (oldLocation == nil || ([oldLocation distanceFromLocation:location] > distanceThreshold)) {

        [self.form syncTicketWithBlock:^(CUTETicket *ticket) {
            ticket.property.latitude = @(location.coordinate.latitude);
            ticket.property.longitude = @(location.coordinate.longitude);
        }];

        [self.textField.indicatorView startAnimating];
        _cancellationTokenSource = [BFCancellationTokenSource cancellationTokenSource];
        [[self checkNeedUpdateAddressWithCancellationToken:_cancellationTokenSource.token] continueWithBlock:^id(BFTask *task) {
            [self.textField.indicatorView stopAnimating];
            _cancellationTokenSource = nil;
            if (task.error || task.exception || task.isCancelled) {
                [SVProgressHUD showErrorWithError:task.error];
                return nil;
            } else {

                return nil;
            }
        }];
    }
}



@end
