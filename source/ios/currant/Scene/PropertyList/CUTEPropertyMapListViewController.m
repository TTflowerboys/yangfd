//
//  CUTEPropertyMapListViewController.m
//  currant
//
//  Created by Foster Yin on 6/1/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEPropertyMapListViewController.h"
#import <MapKit/MapKit.h>
#import <NSObject+Attachment.h>
#import <BBTJSON.h>
#import <MKMapView+BBT.h>
#import <AddressBook/AddressBook.h>
#import "CUTEMapView.h"
#import <SMCalloutView.h>
#import "CUTEConfiguration.h"
#import "NSURL+CUTE.h"
#import "CUTECommonMacro.h"
#import "CUTETracker.h"
#import "CUTENotificationKey.h"
#import "CUTEAPIManager.h"
#import "CUTEProperty.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "NSObject+Attachment.h"
#import "NSArray+ObjectiveSugar.h"
#import "CUTEHouseType.h"
#import "UIAlertView+Blocks.h"

@implementation CUTEPropertyMapListViewController


- (void)loadMapDataWithParams:(NSDictionary *)params {
    if (!IsArrayNilOrEmpty(self.mapView.annotations)) {
        [self.mapView removeAnnotations:self.mapView.annotations];
    }

    [[[CUTEAPIManager sharedInstance] POST:@"/api/1/property/search" parameters:params resultClass:[CUTEProperty class] resultKeyPath:@"val.content"] continueWithBlock:^id(BFTask *task) {
        if (task.error) {
            [SVProgressHUD showErrorWithError:task.error];
        }
        else if (task.exception) {
            [SVProgressHUD showErrorWithException:task.exception];
        }
        else if (task.isCancelled) {
            [SVProgressHUD showErrorWithCancellation];
        }
        else {
            NSArray *propertyList = task.result;

            if (IsArrayNilOrEmpty(propertyList)) {
                [SVProgressHUD showErrorWithStatus:STR(@"暂无结果")];
            }
            else {
                NSMutableArray *locations = [NSMutableArray arrayWithCapacity:propertyList.count];
                NSMutableArray *annotations = [NSMutableArray arrayWithCapacity:propertyList.count];
                for (CUTEProperty *property in propertyList) {
                    CLLocation *location = [[CLLocation alloc] initWithLatitude:property.latitude.doubleValue longitude:property.longitude.doubleValue];
                    if (location) {
                        [locations addObject:location];
                        MKPlacemark *placemark = [[MKPlacemark alloc] initWithCoordinate:location.coordinate addressDictionary:nil];
                        placemark.attachment = property;
                        [annotations addObject:placemark];
                    }
                }
                [self.mapView addAnnotations:annotations];
                [self.mapView zoomToFitMapLocationsInsideArray:locations];

            }
        }
        return task;
    }];
}

- (NSString *)formatPrice:(CGFloat)price symbol:(NSString *)symbol {
    NSString *suffix = @"";
    if  (price > 100000000) {
        price = price / 100000000;
        suffix = STR(@"亿");
    }
    else if (price > 10000) {
        price = price / 10000;
        suffix = STR(@"万");
    }
    NSNumberFormatter *numberFormatter = [[NSNumberFormatter alloc] init];
    [numberFormatter setFormatterBehavior:NSNumberFormatterBehavior10_4];
    [numberFormatter setNumberStyle:NSNumberFormatterCurrencyStyle];
    [numberFormatter setCurrencySymbol:symbol];
    [numberFormatter setMaximumFractionDigits:2];
    NSNumber *c = [NSNumber numberWithFloat:price];
    return CONCAT([numberFormatter stringFromNumber:c], suffix);
}

- (NSString *)getPriceFromProperty:(CUTEProperty *)property {
    if (property.propertyType && [@[@"new_property", @"student_housing"] containsObject:property.propertyType.slug]) {
        CUTEHouseType *houseType = [[property.mainHouseTypes  sortBy:@"totalPriceMin.value"] firstObject];
        return CONCAT([self formatPrice:houseType.totalPriceMin.value symbol:houseType.totalPriceMin.symbol], STR(@"起"));
    }
    return @"";
}

- (void)showCalloutViewWithObject:(id)object inView:(UIView *)view {
    CUTEProperty *property = object;

    self.mapView.calloutView.title = property.name;
    UILabel *subtitleLabel = [[UILabel alloc] init];
    subtitleLabel.opaque = NO;
    subtitleLabel.backgroundColor = [UIColor clearColor];
    subtitleLabel.font = [UIFont systemFontOfSize:12];
    subtitleLabel.textColor = [UIColor blackColor];
    subtitleLabel.frame = CGRectMake(0, 28, 140, 15);
    NSMutableAttributedString *attriString = [[NSMutableAttributedString alloc] initWithString:property.propertyType.value];
    [attriString appendAttributedString:[[NSAttributedString alloc] initWithString:@" "]]; // add space before price
    [attriString appendAttributedString:[[NSAttributedString alloc] initWithString:[self getPriceFromProperty:property] attributes:@{NSForegroundColorAttributeName : HEXCOLOR(0xe60012, 1)}]];
    subtitleLabel.attributedText = attriString;
    self.mapView.calloutView.subtitleView = subtitleLabel;
    self.mapView.calloutView.rightAccessoryView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"icon-accessory"]];
    self.mapView.calloutView.attachment = property;
    [self.mapView.calloutView presentCalloutFromRect:view.bounds inView:view constrainedToView:self.mapView animated:YES];

}

- (void)onMapDidSelectAnnotationView:(MKAnnotationView *)view
{
    if (self.mapView.calloutView.window) {
        [self.mapView.calloutView dismissCalloutAnimated:NO];
    }

    if ([view.annotation isKindOfClass:[MKPlacemark class]]) {

        CUTEProperty *property = [(MKPlacemark *)view.annotation attachment];
        if (!IsNilNullOrEmpty(property.name) && property.propertyType) {
            [self showCalloutViewWithObject:property inView:view];
        }
        else {
            [[[CUTEAPIManager sharedInstance] GET:CONCAT(@"/api/1/property/", property.identifier) parameters:nil resultClass:[CUTEProperty class]] continueWithBlock:^id(BFTask *task) {
                if (task.error) {
                    [SVProgressHUD showErrorWithError:task.error];
                }
                else if (task.exception) {
                    [SVProgressHUD showErrorWithException:task.exception];
                }
                else if (task.isCancelled) {
                    [SVProgressHUD showErrorWithCancellation];
                }
                else {
                    [(MKPlacemark *)view.annotation setAttachment:task.result];
                    [self showCalloutViewWithObject:task.result inView:view];
                }
                return task;
            }];
        }
    }


}

- (void)calloutViewClicked:(SMCalloutView *)calloutView {
    CUTEProperty *property = calloutView.attachment;
    NSURL *url = [NSURL WebURLWithString:CONCAT(@"/property/", property.identifier)];

    [[self navigationController] setNavigationBarHidden:NO animated:NO];
    TrackEvent(GetScreenName(self.url), kEventActionPress, GetScreenName(url), nil);
    CUTEWebViewController *newWebViewController = [[CUTEWebViewController alloc] init];
    newWebViewController.url = url;
    newWebViewController.hidesBottomBarWhenPushed = YES;
    [self.navigationController pushViewController:newWebViewController animated:YES];
    //the progress bar need navigationBar
    [newWebViewController loadRequest:[NSURLRequest requestWithURL:newWebViewController.url]];
}



@end
