//
//  CUTERentListViewController.m
//  currant
//
//  Created by Foster Yin on 6/1/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentListViewController.h"
#import "CUTECommonMacro.h"
#import <BBTJSON.h>
#import "CUTEAPIManager.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTETicket.h"
#import "NSURL+CUTE.h"
#import <MKMapView+BBT.h>
#import <NSObject+Attachment.h>
#import <NSArray+ObjectiveSugar.h>



@implementation CUTERentListViewController


- (void)loadMapData {
    if (!IsArrayNilOrEmpty(self.mapView.annotations)) {
        [self.mapView removeAnnotations:self.mapView.annotations];
    }

    NSString *rawParams = [self.webView stringByEvaluatingJavaScriptFromString:@"JSON.stringify(window.getBaseRequestParams())"];
    NSMutableDictionary *params = [NSMutableDictionary dictionaryWithDictionary:[rawParams JSONObject]];
    [params setObject:@(1) forKey:@"location_only"];

    [[[CUTEAPIManager sharedInstance] POST:@"/api/1/rent_ticket/search" parameters:params resultClass:nil] continueWithBlock:^id(BFTask *task) {
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
            NSArray *ticketList = [(NSArray *)task.result map:^id(NSDictionary *dic) {
                CUTETicket *ticket = [CUTETicket new];
                ticket.identifier = dic[@"id"];
                ticket.property = [CUTEProperty new];
                ticket.property.latitude = [dic[@"latitude"] doubleValue];
                ticket.property.longitude = [dic[@"longitude"] doubleValue];
                return ticket;
            }];

            if (IsArrayNilOrEmpty(ticketList)) {
                [SVProgressHUD showErrorWithStatus:STR(@"暂无结果")];
            }
            else {
                NSMutableArray *locations = [NSMutableArray arrayWithCapacity:ticketList.count];
                NSMutableArray *annotations = [NSMutableArray arrayWithCapacity:ticketList.count];
                for (CUTETicket *ticket in ticketList) {
                    CLLocation *location = [[CLLocation alloc] initWithLatitude:ticket.property.latitude longitude:ticket.property.longitude];
                    [locations addObject:location];
                    MKPlacemark *placemark = [[MKPlacemark alloc] initWithCoordinate:CLLocationCoordinate2DMake(ticket.property.latitude, ticket.property.longitude) addressDictionary:nil];
                    placemark.attachment = ticket;
                    [annotations addObject:placemark];
                }
                [self.mapView addAnnotations:annotations];
                [self.mapView zoomToFitMapLocationsInsideArray:locations];

            }
        }
        return task;
    }];
}

- (NSString *)formatPrice:(CGFloat)price symbol:(NSString *)symbol {
    NSString *suffix = @"/周";
    NSNumberFormatter *numberFormatter = [[NSNumberFormatter alloc] init];
    [numberFormatter setFormatterBehavior:NSNumberFormatterBehavior10_4];
    [numberFormatter setNumberStyle:NSNumberFormatterCurrencyStyle];
    [numberFormatter setCurrencySymbol:symbol];
    [numberFormatter setMaximumFractionDigits:2];
    NSNumber *c = [NSNumber numberWithFloat:price];
    return CONCAT([numberFormatter stringFromNumber:c], suffix);
}

- (void)showCalloutViewWithObject:(id)object inView:(UIView *)view {
    CUTETicket *ticket = object;

    self.mapView.calloutView.title = ticket.titleForDisplay;
    UILabel *subtitleLabel = [[UILabel alloc] init];
    subtitleLabel.opaque = NO;
    subtitleLabel.backgroundColor = [UIColor clearColor];
    subtitleLabel.font = [UIFont systemFontOfSize:12];
    subtitleLabel.textColor = [UIColor blackColor];
    subtitleLabel.frame = CGRectMake(0, 28, 140, 15);
    NSMutableAttributedString *attriString = [[NSMutableAttributedString alloc] initWithString:ticket.rentType.value];
    [attriString appendAttributedString:[[NSAttributedString alloc] initWithString:@" "]]; // add space before price
    [attriString appendAttributedString:[[NSAttributedString alloc] initWithString:[self formatPrice:ticket.price.value symbol:ticket.price.symbol] attributes:@{NSForegroundColorAttributeName : HEXCOLOR(0xe60012, 1)}]];
    subtitleLabel.attributedText = attriString;
    self.mapView.calloutView.subtitleView = subtitleLabel;
    self.mapView.calloutView.rightAccessoryView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"icon-accessory"]];
    self.mapView.calloutView.attachment = ticket;
    [self.mapView.calloutView presentCalloutFromRect:view.bounds inView:view constrainedToView:self.mapView animated:YES];

}

- (void)onMapDidSelectAnnotationView:(MKAnnotationView *)view
{
    if (self.mapView.calloutView.window) {
        [self.mapView.calloutView dismissCalloutAnimated:NO];
    }

    if ([view.annotation isKindOfClass:[MKPlacemark class]]) {

        CUTETicket *ticket = [(MKPlacemark *)view.annotation attachment];
        if (ticket.price && ticket.rentType) {
            [self showCalloutViewWithObject:ticket inView:view];
        }
        else {
            [[[CUTEAPIManager sharedInstance] GET:CONCAT(@"/api/1/rent_ticket/", ticket.identifier) parameters:nil resultClass:[CUTETicket class]] continueWithBlock:^id(BFTask *task) {
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
    CUTETicket *ticekt = calloutView.attachment;
    NSURL *url = [NSURL WebURLWithString:CONCAT(@"/property-to-rent/", ticekt.identifier)];

    [[self navigationController] setNavigationBarHidden:NO animated:NO];
    [self loadURLInNewController:url];
}



@end
